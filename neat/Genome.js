class Genome {
  constructor(
    inputs /* :number */,
    outputs /* :number */,
    crossover /* :boolean */
  ) {
    this.genes = []; /* :Node[] */
    this.nodes = []; /* :Node[] */
    this.inputs = inputs; /* :number */
    this.outputs = outputs; /* :number */
    this.layers = 2; /* :number */
    this.nextNode = 0; /* :number */
    this.network = []; /* :Node[] */

    if (crossover) return;

    for (let i = 0; i < this.inputs; i++) {
      this.nodes.push(new Node(i));
      this.nextNode++;
      this.nodes[i].layer = 0;
    }

    for (let i = 0; i < this.outputs; i++) {
      this.nodes.push(new Node(i + this.inputs));
      this.nodes[i + this.inputs].layer = 1;
      this.nextNode++;
    }

    //bias Node
    this.nodes.push(new Node(this.nextNode));
    this.biasNode = this.nextNode;
    this.nextNode++;
    this.nodes[this.biasNode].layer = 0;
  }

  getNode(nodeNumber /* :number */) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].number == nodeNumber) {
        return this.nodes[i];
      }
    }
    return null;
  }

  connectNodes() {
    this.nodes.forEach((node) => {
      node.outputConnections = [];
    });
    this.genes.forEach((gene) => {
      gene.fromNode.outputConnections.push(gene);
    });
  }

  feedForward(inputValues /* :number[] */) {
    for (let i = 0; i < this.inputs; i++) {
      this.nodes[i].outputValue = inputValues[i];
    }
    this.nodes[this.biasNode].outputValue = 1;

    this.network.forEach((nodes) => {
      nodes.engage();
    });

    //index prvog outputa je this.nodes[this.inputs]
    //index zadnjeg outputa je this.nodes[this.inputs + this.outputs - 1]
    let outs = [];
    for (let i = 0; i < this.outputs; i++) {
      outs[i] = this.nodes[this.inputs + i].outputValue;
    }

    this.nodes.forEach((node) => {
      node.inputSum = 0;
    });

    return outs;
  }

  generateNetwork() {
    this.connectNodes();
    this.network = [];

    for (let l = 0; l < this.layers; l++) {
      //za svaki sloj
      for (let i = 0; i < this.nodes.length; i++) {
        //za svaki node
        if (this.nodes[i].layer == l) {
          this.network.push(this.nodes[i]);
        }
      }
    }
  }

  addNode() {
    //bira se random konekcija
    if (this.genes.length == 0) {
      this.addConnection();
      return;
    }
    let randomConnection = floor(random(this.genes.length));

    while (
      this.genes[randomConnection].fromNode == this.nodes[this.biasNode] &&
      this.genes.length != 1
    ) {
      randomConnection = floor(random(this.genes.length));
    }

    this.genes[randomConnection].enabled = false;

    let newNodeNo = this.nextNode;
    this.nodes.push(new Node(newNodeNo));
    this.nextNode++;
    //dodaje se nova konekcija sa tezinom 1
    let connectionInnovationNumber = this.getInnovationNumber(
      this.genes[randomConnection].fromNode,
      this.getNode(newNodeNo)
    );
    this.genes.push(
      new connectionGene(
        this.genes[randomConnection].fromNode,
        this.getNode(newNodeNo),
        1,
        connectionInnovationNumber
      )
    );

    connectionInnovationNumber = this.getInnovationNumber(
      this.getNode(newNodeNo),
      this.genes[randomConnection].toNode
    );
    //dodaje se nova konekcija iz novog node-a sa tezinom istom kao iskljucena konekcija
    this.genes.push(
      new connectionGene(
        this.getNode(newNodeNo),
        this.genes[randomConnection].toNode,
        this.genes[randomConnection].weight,
        connectionInnovationNumber
      )
    );
    this.getNode(newNodeNo).layer =
      this.genes[randomConnection].fromNode.layer + 1;

    connectionInnovationNumber = this.getInnovationNumber(
      this.nodes[this.biasNode],
      this.getNode(newNodeNo)
    );
    //povezuje se bias na novi node sa tezinom 0
    this.genes.push(
      new connectionGene(
        this.nodes[this.biasNode],
        this.getNode(newNodeNo),
        0,
        connectionInnovationNumber
      )
    );

    //ako je sloj novog node-a jednaka sloju output node-a stare konekcije, kreira se novi sloj
    //broj sloja svih slojeva jednak ili veci od novog node-a moraju biti inkrementirani
    if (
      this.getNode(newNodeNo).layer == this.genes[randomConnection].toNode.layer
    ) {
      for (let i = 0; i < this.nodes.length - 1; i++) {
        //ne ukljucujemo novi node
        if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
          this.nodes[i].layer++;
        }
      }
      this.layers++;
    }
    this.connectNodes();
  }

  addConnection() {
    if (this.fullyConnected()) {
      console.log("connection failed");
      return;
    }

    let randomNode1 = floor(random(this.nodes.length));
    let randomNode2 = floor(random(this.nodes.length));
    while (this.randomConnectionNodesAreBad(randomNode1, randomNode2)) {
      randomNode1 = floor(random(this.nodes.length));
      randomNode2 = floor(random(this.nodes.length));
    }

    //ako je prvi random node iza drugog, zamenimo ih
    let temp;
    if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) {
      temp = randomNode2;
      randomNode2 = randomNode1;
      randomNode1 = temp;
    }

    let connectionInnovationNumber = this.getInnovationNumber(
      this.nodes[randomNode1],
      this.nodes[randomNode2]
    );
    this.genes.push(
      new connectionGene(
        this.nodes[randomNode1],
        this.nodes[randomNode2],
        random(-1, 1),
        connectionInnovationNumber
      )
    );
    this.connectNodes();
  }

  randomConnectionNodesAreBad(r1, r2) {
    if (this.nodes[r1].layer == this.nodes[r2].layer) return true; // ako su u istom sloju
    if (this.nodes[r1].isConnectedTo(this.nodes[r2])) return true; // ako su vec povezani

    return false;
  }

  getInnovationNumber(node1, node2) {
    //Koristimo funkciju uparivanja: https://en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
    return (
      (1 / 2) *
        (node1.number + node2.number) *
        (node1.number + node2.number + 1) +
      node2.number
    );
  }

  //da li je mreza potpuno povezana
  fullyConnected() {
    let maxConnections = 0;
    let nodesInLayers = [];
    for (let i = 0; i < this.layers; i++) {
      nodesInLayers[i] = 0;
    }
    for (let i = 0; i < this.nodes.length; i++) {
      nodesInLayers[this.nodes[i].layer] += 1;
    }

    //za svaki sloj maximalna kolicina konekcija je broj u ovom sloju * broju node-a ispred njega
    //maximalni broj konekcija u mrezi
    for (let i = 0; i < this.layers - 1; i++) {
      let nodesInFront = 0;
      for (let j = i + 1; j < this.layers; j++) {
        nodesInFront += nodesInLayers[j];
      }

      maxConnections += nodesInLayers[i] * nodesInFront;
    }
    if (maxConnections <= this.genes.length) {
      //ako je broj konekcija jednak maksimalnom mogucem broju konekcija onda je pun
      return true;
    }

    return false;
  }

  mutate() {
    if (this.genes.length == 0) {
      this.addConnection();
    }
    let rand1 = random(1);
    if (rand1 < 0.8) {
      //80% da se mutira tezina
      for (let i = 0; i < this.genes.length; i++) {
        this.genes[i].mutateWeight();
      }
    }
    //5% da se doda nova konekcija
    let rand2 = random(1);
    if (rand2 < 0.05) {
      this.addConnection();
    }
    //1% da se doda novi node
    let rand3 = random(1);
    if (rand3 < 0.01) {
      this.addNode();
    }
  }

  crossover(parent2) {
    let child = new Genome(this.inputs, this.outputs, true);
    child.genes = [];
    child.nodes = [];
    child.layers = this.layers;
    child.nextNode = this.nextNode;
    child.biasNode = this.biasNode;
    let childGenes = []; // :connectionGene; lista gena koja ce se naslediti od roditelja
    let isEnabled = []; // :boolean
    //svi nasledjeni geni
    for (let i = 0; i < this.genes.length; i++) {
      let setEnabled = true; //da li ce ovaj node kod deteta da bude enabled

      let parent2gene = this.matchingGene(parent2, this.genes[i].innovationNo);
      if (parent2gene != -1) {
        //ako su geni isti
        if (!this.genes[i].enabled || !parent2.genes[parent2gene].enabled) {
          //ako je bilo koj od gena disabled

          if (random(1) < 0.75) {
            //75% da se disable-uje detetov gen
            setEnabled = false;
          }
        }
        let rand = random(1);
        if (rand < 0.5) {
          childGenes.push(this.genes[i]);
        } else {
          childGenes.push(parent2.genes[parent2gene]);
        }
      } else {
        childGenes.push(this.genes[i]);
        setEnabled = this.genes[i].enabled;
      }
      isEnabled.push(setEnabled);
    }

    //posto su svi suvisni geni nasledjeni od sposobnijeg roditelja (this Genome) struktura deteta je ista kao kod tog roditelja
    for (let i = 0; i < this.nodes.length; i++) {
      child.nodes.push(this.nodes[i].clone());
    }

    //kloniramo sve konekcije da bi mogle da se povezu sa detetovim novim node-om
    for (let i = 0; i < childGenes.length; i++) {
      child.genes.push(
        childGenes[i].clone(
          child.getNode(childGenes[i].fromNode.number),
          child.getNode(childGenes[i].toNode.number)
        )
      );
      child.genes[i].enabled = isEnabled[i];
    }

    child.connectNodes();
    return child;
  }


  //da li postoji gen koji je isti input inovation number-u u input genu
  matchingGene(parent2, innovationNumber) {
    for (let i = 0; i < parent2.genes.length; i++) {
      if (parent2.genes[i].innovationNo == innovationNumber) {
        return i;
      }
    }
    return -1; //nije nadjen
  }

  clone() {
    let clone = new Genome(this.inputs, this.outputs, true);
    for (let i = 0; i < this.nodes.length; i++) {
      clone.nodes.push(this.nodes[i].clone());
    }

    for (let i = 0; i < this.genes.length; i++) {
      const gen = this.genes[i].clone(
        clone.getNode(this.genes[i].fromNode.number),
        clone.getNode(this.genes[i].toNode.number)
      );
      clone.genes.push(
        this.genes[i].clone(
          clone.getNode(this.genes[i].fromNode.number),
          clone.getNode(this.genes[i].toNode.number)
        )
      );
    }

    clone.layers = this.layers;
    clone.nextNode = this.nextNode;
    clone.biasNode = this.biasNode;
    clone.connectNodes();

    return clone;
  }

  drawGenome(startX, startY, w, h) {
    let allNodes = []; // :Node[]
    let nodePoses = []; // :p5.Vector[]
    let nodeNumbers = []; // :Number[]

    //pozicija svakog node-a

    for (let i = 0; i < this.layers; i++) {
      let temp = []; // :Node[]
      for (let j = 0; j < this.nodes.length; j++) {
        if (this.nodes[j].layer == i) {
          temp.push(this.nodes[j]);
        }
      }
      allNodes.push(temp);
    }

    //za svaki sloj dodati poziciju node-a u nodePoses
    for (let i = 0; i < this.layers; i++) {
      fill(255, 0, 0);
      let x = startX + float((i + 1.0) * w) / float(this.layers + 1.0);
      for (let j = 0; j < allNodes[i].length; j++) {
        let y = startY + float((j + 1.0) * h) / float(allNodes[i].length + 1.0);
        nodePoses.push(createVector(x, y));
        nodeNumbers.push(allNodes[i][j].number);
      }
    }

    //crtaj konekcije
    stroke(0);
    strokeWeight(2);
    for (let i = 0; i < this.genes.length; i++) {
      if (this.genes[i].enabled) {
        stroke(0);
      } else {
        stroke(100);
      }
      let from;
      let to;
      from = nodePoses[nodeNumbers.indexOf(this.genes[i].fromNode.number)];
      to = nodePoses[nodeNumbers.indexOf(this.genes[i].toNode.number)];
      if (this.genes[i].weight > 0) {
        stroke(255, 0, 0);
      } else {
        stroke(0, 0, 255);
      }
      strokeWeight(map(abs(this.genes[i].weight), 0, 1, 0, 3));
      line(from.x, from.y, to.x, to.y);
    }

    for (let i = 0; i < nodePoses.length; i++) {
      fill(255);
      stroke(0);
      strokeWeight(1);
      ellipse(nodePoses[i].x, nodePoses[i].y, 20, 20);
      textSize(15);
      textFont('Arial');
      fill(0);
      textAlign(CENTER, CENTER);
      text(nodeNumbers[i], nodePoses[i].x, nodePoses[i].y);
    }
  }
}
