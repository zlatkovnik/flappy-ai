class Genome {
  constructor(inputs /* :number */, outputs /* :number */, crossover /* :boolean */) {
    this.genes = []; /* :Node[] */
    this.nodes = []; /* :Node[] */
    this.inputs = inputs; /* :number */
    this.outputs = outputs; /* :number */
    this.layers = 2; /* :number */
    this.nextNode = 0; /* :number */
    this.network = [];  /* :Node[] */

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
  getNode(nodeNumber /* :number */) {
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

  feedForward(inputValues /* :number[] */) {
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
}
