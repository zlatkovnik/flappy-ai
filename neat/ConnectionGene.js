class connectionGene {
  constructor(from, to, weight, innovationN) {
    this.fromNode = from;
    this.toNode = to;
    this.weight = weight;
    this.enabled = false;
    this.innovationNo = innovationN;
  }

  mutateWeight() {
    let rand = random(1);
    if (rand < 0.1) this.weight = random(-1, 1);
    //10%
    else this.weight += randomGaussian() / 50;

    if (this.weight > 1) this.weight = 1;
    if (this.weight < -1) this.weight = -1;
  }

  clone() {
    let clone = new connectionGene(from, to, this.weight, this.innovationNo);
    clone.enabled = this.enabled;

    return clone;
  }
}
