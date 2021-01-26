class Brain extends Player {
  constructor(x, y, sv, g, fs) {
    super(x, y, sv, g, fs);

    this.fitness = 0; /* :number */
    this.vision = []; //input niz koji se prosledjuje mrezi
    //this.vision[0] je trenutna brzina
    //this.vision[1] je distanca do najblizeg stuba
    //this.vision[2] je visina ptice u odnosu na donji stub
    //this.vision[3] je visina ptice u odnosu na gornji stub
    this.decision = []; //output mreze
    this.unadjustedFitness;
    this.lifespan = 0; //koliko dugo je ziv (fitnes)
    this.bestScore = 0;
    this.gen = 0;

    this.genomeInputs = 4;
    this.genomeOutputs = 1;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
  }

  look() {
    this.lifespan++;
    this.vision = [];
    this.vision[0] = map(this.yVel, -10, 10, -1, 1);
    const closestPipe = this.getClosestPipe();
    const distanceToClosestPipe = closestPipe.x + closestPipe.w / 2 - this.x;
    this.vision[1] = map(distanceToClosestPipe, 0, width - this.x, 1, 0);
    this.vision[2] = map(
      max(0, closestPipe.y + closestPipe.gap / 2 - this.y),
      0,
      this.ground.y - closestPipe.gap / 2,
      0,
      1
    ); //height above bottomY
    this.vision[3] = map(
      max(0, this.y - closestPipe.y - closestPipe.gap / 2),
      0,
      this.ground.y - closestPipe.gap / 2,
      0,
      1
    ); //distance below topThing
  }

  think() {
    //output mreze
    this.decision = this.brain.feedForward(this.vision);
    if (this.decision[0] > 0.6) {
      this.flap();
    }
  }

  clone() {
    var clone = new Brain(width / 3, height / 2, width / 200, 0.4, 10);
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  calculateFitness() {
    this.fitness = 1 + this.score * this.score + this.lifespan / 20;
  }

  crossover(parent2 /* :Brain */) {
    var child = new Brain(width / 3, height / 2, width / 200, 0.4, 10);
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

  cloneForReplay() {
    var clone = new Brain(width / 3, height / 2, width / 200, 0.4, 10);
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  getClosestPipe() {
    let closestPipe = this.pipe1;
    if (
      !this.pipe2.scored &&
      (this.pipe1.scored || this.pipe1.x - this.pipe2.x > 0)
    ) {
      closestPipe = this.pipe2;
    }
    return closestPipe;
  }
}
