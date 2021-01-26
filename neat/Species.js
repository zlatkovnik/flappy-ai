class Species {
  constructor(p) {
    this.players = []; /* :Brain[] */
    this.bestFitness = 0;
    this.champ; /* Brain */
    this.averageFitness = 0;
    this.staleness = 0; //Koliko je proslo generacija bez napretka
    this.rep;

    if (p) {
      this.players.push(p);
      //S obzirom da je jedini u vrsti, najbolji je
      this.bestFitness = p.fitness;
      this.rep = p.brain.clone();
      this.champ = p.clone();
    }
  }

  //Proverava da li je genom iz ove vrste
  sameSpecies(g) {
    const excessAndDisjoint = this.getExcessDisjoint(g, this.rep);
    const averageWeightDiff = this.averageWeightDiff(g, this.rep);

    let largeGenomeNormaliser = g.genes.length - 20;
    if (largeGenomeNormaliser < 1) {
      largeGenomeNormaliser = 1;
    }

    //Formula za kompatibilnost
    const compatibility = excessAndDisjoint / largeGenomeNormaliser + 0.5 * averageWeightDiff;
    return 3 > compatibility;
  }

  addToSpecies(p) {
    this.players.push(p);
  }

  //Vraca broj gena koji nisu isti
  getExcessDisjoint(brain1, brain2) {
    let matching = 0.0;
    for (let i = 0; i < brain1.genes.length; i++) {
      for (let j = 0; j < brain2.genes.length; j++) {
        if (brain1.genes[i].innovationNo == brain2.genes[j].innovationNo) {
          matching++;
          break;
        }
      }
    }
    return brain1.genes.length + brain2.genes.length - 2 * matching;
  }

  //Vraca prosecnu razliku tezina izmedju genoma
  averageWeightDiff(brain1, brain2) {
    if (brain1.genes.length == 0 || brain2.genes.length == 0) {
      return 0;
    }

    var matching = 0;
    var totalDiff = 0;
    for (var i = 0; i < brain1.genes.length; i++) {
      for (var j = 0; j < brain2.genes.length; j++) {
        if (brain1.genes[i].innovationNo == brain2.genes[j].innovationNo) {
          matching++;
          totalDiff += abs(brain1.genes[i].weight - brain2.genes[j].weight);
          break;
        }
      }
    }
    if (matching == 0) {
      return 100;
    }
    return totalDiff / matching;
  }
  
  //Sortira vrste po fitnesu
  sortSpecies() {

    this.quickSort(this.players, 0, this.players.length - 1);

    if (this.players.length == 0) {
      this.staleness = 200;
      return;
    }
    //Ako je nastao bolji igrac
    if (this.players[0].fitness > this.bestFitness) {
      this.staleness = 0;
      this.bestFitness = this.players[0].fitness;
      this.rep = this.players[0].brain.clone();
      this.champ = this.players[0].clone();
    } else {
      //Ako ne postoji bolji igrac
      this.staleness++;
    }
  }

  quickSort(players, left, right){
    let index;
    if(players.length > 1){
      index = this.partition(players, left, right);
      if(left < index - 1)
        this.quickSort(players, left, index - 1);
      if (index < right) {
        this.quickSort(players, index, right);
      }
    }
    return players;
  }

  partition(players, left, right) {
    let pivot = players[Math.floor((right + left) / 2)];
    let i = left;
    let j = right;
    while (i <= j) {
        while (players[i].fitness < pivot) {
            i++;
        }
        while (players[j].fitness > pivot) {
            j--;
        }
        if (i <= j) {
            const temp = players[i];
            players[i] = players[j];
            players[j] = temp;
            i++;
            j--;
        }
    }
    return i;
}

  //Setuje prosecan fitnes
  setAverage() {
    var sum = 0;
    for (var i = 0; i < this.players.length; i++) {
      sum += this.players[i].fitness;
    }
    this.averageFitness = sum / this.players.length;
  }

  //Pravi bebu na osnovu dva dobra roditelja
  giveMeBaby() {
    let baby;
    if (random(1) < 0.25) {
      //25% sansa da je da se ne pravi dete, vec da bude relativno nasumican igrac
      baby = this.selectPlayer().clone();
    } else {
      //75% sansa da se radi reprodukcija dva roditelja
      const parent1 = this.selectPlayer();
      const parent2 = this.selectPlayer();
      //crossover funkcija ocekuje da objekat bude bolji roditelj, a gori argument
      if (parent1.fitness < parent2.fitness) {
        baby = parent2.crossover(parent1);
      } else {
        baby = parent1.crossover(parent2);
      }
    }
    baby.brain.mutate(); //Mutiraju se geni deteta
    return baby;
  }

  //bira igraca u odnosu na fitnes
  selectPlayer() {
    let fitnessSum = 0;
    for (let i = 0; i < this.players.length; i++) {
      fitnessSum += this.players[i].fitness;
    }
    const rand = random(fitnessSum);
    let runningSum = 0;

    for (let i = 0; i < this.players.length; i++) {
      runningSum += this.players[i].fitness;
      if (runningSum > rand) {
        return this.players[i];
      }
    }
  }

  //Ubija donju polovinu vrste
  cull() {
    const players = [];
    for(let i = 0; i < this.players.length / 2; i++){
      players.push(this.players[i]);
    }
    this.players = players;
  }
}
