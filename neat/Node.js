class Node {
  constructor(num) {
    this.number = num; /* :number */
    this.inputSum = 0; /* :number */
    this.outputValue = 0; /* :number */
    this.outputConnections = []; /* :ConnectionGene[] */
    this.layer = 0; /* :number */
    this.drawPos = createVector(); /* :p5.Vector */
  }

  engage() {
    if (this.layer != 0) {
      this.outputValue = this.sigmoid(this.inputSum);
    }
    this.outputConnections.forEach((output) => {
      if (output.enabled) {
        output.toNode.inputSum += output.weight * this.outputValue;
      }
    });
  }
  sigmoid(x /* :number */) {
    return 1.0 / (1.0 + pow(Math.E, -4.9 * x));
  }
  isCOnnected(node /* :Node */) {
    if (node.layer == this.layer) return false;

    if (node.layer < this.layer) {
      this.outputConnections.forEach((outputCon) => {
        if (outputCon.toNode == this) return true;
      });
    } else {
      this.outputConnections.forEach((outputCon) => {
        if (outputCon.toNode == node) return true;
      });
    }

    return false;
  }

  clone() {
    let clone = new Node(this.number);
    clone.layer = this.layer;
    return clone;
  }
}
