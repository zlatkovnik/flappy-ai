class Genome {
  constructor(inputs, outputs, crossover) {
    this.genes = [];
    this.nodes = [];
    this.inputs = inputs;
    this.outputs = outputs;
    this.layers = 2;
    this.nextNode = 0;
    this.network = []; //this.Nodes[]

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

  fullyConnect(innovationHistory) {
    //toDo
  }
  getNode(nodeNumber) {
    this.nodes.forEach((node) => {
      if (node.number == nodeNumber) return node;
    });
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

  feedForward(inputValues) {
    for (let i = 0; i < this.inputs; i++) {
      this.nodes[i].outputValue = inputValues[i];
    }
    this.nodes[this.biasNode].outputValue = 1;

    this.network.forEach((nodes) => {
      nodes.engage();
    });

    //this.nodes[inputs] to this.nodes [inputs+outputs-1]
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
      //for each layer
      for (var i = 0; i < this.nodes.length; i++) {
        //for each node
        if (this.nodes[i].layer == l) {
          //if that node is in that layer
          this.network.push(this.nodes[i]);
        }
      }
    }
  }

  addNode(innovationHistory) {
    //pick a random connection to create a node between
    if (this.genes.length == 0) {
      this.addConnection(innovationHistory);
      return;
    }
    let randomConnection = floor(random(this.genes.length));

    while (
      this.genes[randomConnection].fromNode == this.nodes[this.biasNode] &&
      this.genes.length != 1
    ) {
      //dont disconnect bias
      randomConnection = floor(random(this.genes.length));
    }

    this.genes[randomConnection].enabled = false; //disable it

    let newNodeNo = this.nextNode;
    this.nodes.push(new Node(newNodeNo));
    this.nextNode++;
    //add a new connection to the new node with a weight of 1
    let connectionInnovationNumber = this.getInnovationNumber(
      innovationHistory,
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
      innovationHistory,
      this.getNode(newNodeNo),
      this.genes[randomConnection].toNode
    );
    //add a new connection from the new node with a weight the same as the disabled connection
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
      innovationHistory,
      this.nodes[this.biasNode],
      this.getNode(newNodeNo)
    );
    //connect the bias to the new node with a weight of 0
    this.genes.push(
      new connectionGene(
        this.nodes[this.biasNode],
        this.getNode(newNodeNo),
        0,
        connectionInnovationNumber
      )
    );

    //if the layer of the new node is equal to the layer of the output node of the old connection then a new layer needs to be created
    //more accurately the layer numbers of all layers equal to or greater than this new node need to be incrimented
    if (
      this.getNode(newNodeNo).layer == this.genes[randomConnection].toNode.layer
    ) {
      for (let i = 0; i < this.nodes.length - 1; i++) {
        //dont include this newest node
        if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
          this.nodes[i].layer++;
        }
      }
      this.layers++;
    }
    this.connectNodes();
  }

  addConnection(innovationHistory) {
    if (this.fullyConnected()) {
      console.log("connection failed");
      return;
    }

    let randomNode1 = floor(random(this.nodes.length));
    let randomNode2 = floor(random(this.nodes.length));
    while (this.randomConnectionNodesAreShit(randomNode1, randomNode2)) {
      randomNode1 = floor(random(this.nodes.length));
      randomNode2 = floor(random(this.nodes.length));
    }

    //if the first random node is after the second then switch
    let temp;
    if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) {
      temp = randomNode2;
      randomNode2 = randomNode1;
      randomNode1 = temp;
    }

    let connectionInnovationNumber = this.getInnovationNumber(
      innovationHistory,
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
    ); //changed this so if error here
    this.connectNodes();
  }

  randomConnectionNodesAreShit(r1, r2) {
    if (this.nodes[r1].layer == this.nodes[r2].layer) return true; // if the this.nodes are in the same layer
    if (this.nodes[r1].isConnectedTo(this.nodes[r2])) return true; //if the this.nodes are already connected

    return false;
  }

  getInnovationNumber(innovationHistory, from, to) {
    let isNew = true;
    let connectionInnovationNumber = nextConnectionNo;
    for (let i = 0; i < innovationHistory.length; i++) {
      //for each previous mutation
      if (innovationHistory[i].matches(this, from, to)) {
        //if match found
        isNew = false; //its not a new mutation
        connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
        break;
      }
    }

    if (isNew) {
      //if the mutation is new then create an arrayList of varegers representing the current state of the genome
      let innoNumbers = [];
      for (let i = 0; i < this.genes.length; i++) {
        //set the innovation numbers
        innoNumbers.push(this.genes[i].innovationNo);
      }

      //then add this mutation to the innovationHistory
      innovationHistory.push(
        new connectionHistory(
          from.number,
          to.number,
          connectionInnovationNumber,
          innoNumbers
        )
      );
      nextConnectionNo++;
    }
    return connectionInnovationNumber;
  }

  //returns whether the network is fully connected or not
  fullyConnected() {
    let maxConnections = 0;
    let nodesInLayers = []; //array which stored the amount of this.nodes in each layer
    for (let i = 0; i < this.layers; i++) {
      nodesInLayers[i] = 0;
    }
    //populate array
    for (let i = 0; i < this.nodes.length; i++) {
      nodesInLayers[this.nodes[i].layer] += 1;
    }
    //for each layer the maximum amount of connections is the number in this layer * the number of this.nodes infront of it
    //so lets add the max for each layer together and then we will get the maximum amount of connections in the network
    for (let i = 0; i < this.layers - 1; i++) {
      let nodesInFront = 0;
      for (let j = i + 1; j < this.layers; j++) {
        //for each layer infront of this layer
        nodesInFront += nodesInLayers[j]; //add up this.nodes
      }

      maxConnections += nodesInLayers[i] * nodesInFront;
    }
    if (maxConnections <= this.genes.length) {
      //if the number of connections is equal to the max number of connections possible then it is full
      return true;
    }

    return false;
  }

  crossover(parent2) {
    var child = new Genome(this.inputs, this.outputs, true);
    child.genes = [];
    child.nodes = [];
    child.layers = this.layers;
    child.nextNode = this.nextNode;
    child.biasNode = this.biasNode;
    var childGenes = []; // new ArrayList<connectionGene>();//list of genes to be inherrited form the parents
    var isEnabled = []; // new ArrayList<Boolean>();
    //all inherited genes
    for (var i = 0; i < this.genes.length; i++) {
      var setEnabled = true; //is this node in the chlid going to be enabled

      var parent2gene = this.matchingGene(parent2, this.genes[i].innovationNo);
      if (parent2gene != -1) {
        //if the genes match
        if (!this.genes[i].enabled || !parent2.genes[parent2gene].enabled) {
          //if either of the matching genes are disabled

          if (random(1) < 0.75) {
            //75% of the time disabel the childs gene
            setEnabled = false;
          }
        }
        var rand = random(1);
        if (rand < 0.5) {
          childGenes.push(this.genes[i]);

          //get gene from this fucker
        } else {
          //get gene from parent2
          childGenes.push(parent2.genes[parent2gene]);
        }
      } else {
        //disjoint or excess gene
        childGenes.push(this.genes[i]);
        setEnabled = this.genes[i].enabled;
      }
      isEnabled.push(setEnabled);
    }

    //since all excess and disjovar genes are inherrited from the more fit parent (this Genome) the childs structure is no different from this parent | with exception of dormant connections being enabled but this wont effect this.nodes
    //so all the this.nodes can be inherrited from this parent
    for (var i = 0; i < this.nodes.length; i++) {
      child.nodes.push(this.nodes[i].clone());
    }

    //clone all the connections so that they connect the childs new this.nodes

    for (var i = 0; i < childGenes.length; i++) {
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

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns whether or not there is a gene matching the input innovation number  in the input genome
  matchingGene(parent2, innovationNumber) {
    for (var i = 0; i < parent2.genes.length; i++) {
      if (parent2.genes[i].innovationNo == innovationNumber) {
        return i;
      }
    }
    return -1; //no matching gene found
  }
  //----------------------------------------------------------------------------------------------------------------------------------------
  //prints out info about the genome to the console
  printGenome() {
    console.log("Prvar genome  layers:" + this.layers);
    console.log("bias node: " + this.biasNode);
    console.log("this.nodes");
    for (var i = 0; i < this.nodes.length; i++) {
      console.log(this.nodes[i].number + ",");
    }
    console.log("Genes");
    for (var i = 0; i < this.genes.length; i++) {
      //for each connectionGene
      console.log(
        "gene " +
          this.genes[i].innovationNo +
          "From node " +
          this.genes[i].fromNode.number +
          "To node " +
          this.genes[i].toNode.number +
          "is enabled " +
          this.genes[i].enabled +
          "from layer " +
          this.genes[i].fromNode.layer +
          "to layer " +
          this.genes[i].toNode.layer +
          "weight: " +
          this.genes[i].weight
      );
    }

    console.log();
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns a copy of this genome
  clone() {
    var clone = new Genome(this.inputs, this.outputs, true);

    for (var i = 0; i < this.nodes.length; i++) {
      //copy this.nodes
      clone.nodes.push(this.nodes[i].clone());
    }

    //copy all the connections so that they connect the clone new this.nodes

    for (var i = 0; i < this.genes.length; i++) {
      //copy genes
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
  //----------------------------------------------------------------------------------------------------------------------------------------
  //draw the genome on the screen
  drawGenome(startX, startY, w, h) {
    //i know its ugly but it works (and is not that important) so I'm not going to mess with it
    var allNodes = []; //new ArrayList<ArrayList<Node>>();
    var nodePoses = []; // new ArrayList<PVector>();
    var nodeNumbers = []; // new ArrayList<Integer>();

    //get the positions on the screen that each node is supposed to be in

    //split the this.nodes varo layers
    for (var i = 0; i < this.layers; i++) {
      var temp = []; // new ArrayList<Node>();
      for (var j = 0; j < this.nodes.length; j++) {
        //for each node
        if (this.nodes[j].layer == i) {
          //check if it is in this layer
          temp.push(this.nodes[j]); //add it to this layer
        }
      }
      allNodes.push(temp); //add this layer to all this.nodes
    }

    //for each layer add the position of the node on the screen to the node posses arraylist
    for (var i = 0; i < this.layers; i++) {
      fill(255, 0, 0);
      var x = startX + float((i + 1.0) * w) / float(this.layers + 1.0);
      for (var j = 0; j < allNodes[i].length; j++) {
        //for the position in the layer
        var y = startY + float((j + 1.0) * h) / float(allNodes[i].length + 1.0);
        nodePoses.push(createVector(x, y));
        nodeNumbers.push(allNodes[i][j].number);
      }
    }

    //draw connections
    stroke(0);
    strokeWeight(2);
    for (var i = 0; i < this.genes.length; i++) {
      if (this.genes[i].enabled) {
        stroke(0);
      } else {
        stroke(100);
      }
      var from;
      var to;
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

    //draw this.nodes last so they appear ontop of the connection lines
    for (var i = 0; i < nodePoses.length; i++) {
      fill(255);
      stroke(0);
      strokeWeight(1);
      ellipse(nodePoses[i].x, nodePoses[i].y, 20, 20);
      textSize(10);
      fill(0);
      textAlign(CENTER, CENTER);
      text(nodeNumbers[i], nodePoses[i].x, nodePoses[i].y);
    }
  }
}
