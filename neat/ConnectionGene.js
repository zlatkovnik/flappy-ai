class connectionGene {
  constructor(from, to, weight, innovationN) {
    this.fromNode = from; /* :Node */
    this.toNode = to; /* :Node */
    this.weight = weight; /* :number */
    this.enabled = false; /* :boolean */
    this.innovationNo = innovationN; /* :number */
  }

  mutateWeight() {
    let rand = random(1);
    //10%
    if (rand < 0.1) this.weight = random(-1, 1);
    else this.weight += randomGaussian() / 50;

    if (this.weight > 1) this.weight = 1;
    if (this.weight < -1) this.weight = -1;
  }

  clone() {
    let clone = new connectionGene(from, to, this.weight, this.innovationNo);
    clone.enabled = this.enabled;

    return clone;
  }
  //todo
  getInnovationNumber() {
    //Using https://en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
    return (
      (1 / 2) *
        (this.fromNode.number + this.toNode.number) *
        (this.fromNode.number + this.toNode.number + 1) +
      this.toNode.number
    );
  }
}
