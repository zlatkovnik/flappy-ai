class Population {
  constructor(size) {
    this.players = []; //:Player[]
    this.bestPlayer;
    this.bestScore = 0;
    this.globalBestScore = 0;
    this.gen = 1;
    this.genPlayers = []; //:Player[]
    this.species = []; //:Species[]

    this.massExtinctionEvent = false;
    this.newStage = false;

    this.gensSinceNewWorld = 0;

    for (let i = 0; i < size; i++) {
      this.players.push(new Brain(width / 3, height / 2, width / 200, 0.4, 7));
      this.players[this.players.length - 1].brain.mutate();
      this.players[this.players.length - 1].brain.generateNetwork();
    }
  }

  getCurrentBest() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        return this.players[i];
      }
    }
    return this.players[0];
  }
  updateAlive() {
    let bestPlayer;
    for (let i = 0; i < this.players.length; i++) {
      bestPlayer = this.players[i];
      if (!bestPlayer.dead) break;
    }
    bestPlayer.show();
    bestPlayer.brain.drawGenome(width / 2, 0, width / 2, height / 2);
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        this.players[i].look(); //uzima inpute za mozak
        this.players[i].think(); //koristi outpute za mrezu
        this.players[i].update(); //pomera pticu u zavisnosti od outputa mreze

        if (this.players[i].score > this.globalBestScore) {
          this.globalBestScore = this.players[i].score;
        }
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //true ako su svi igraci mrtvi
  done() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        return false;
      }
    }
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------------------

  setBestPlayer() {
    let tempBest = this.species[0].players[0];
    tempBest.gen = this.gen;

    if (tempBest.score >= this.bestScore) {
      this.genPlayers.push(tempBest.cloneForReplay());
      console.log("old best: " + this.bestScore);
      console.log("new best: " + tempBest.score);
      this.bestScore = tempBest.score;
      this.bestPlayer = tempBest.cloneForReplay();
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------
  //zove se kada su svi igraci mrtvi (this.players) i nova generacija se pravi
  naturalSelection() {
    let previousBest = this.players[0];
    this.speciate(); //seperate the this.players varo this.species
    this.calculateFitness(); //calculate the fitness of each player
    this.sortSpecies(); //sort the this.species to be ranked in fitness order, best first
    if (this.massExtinctionEvent) {
      this.massExtinction();
      this.massExtinctionEvent = false;
    }
    this.cullSpecies(); //kill off the bottom half of each this.species
    this.setBestPlayer(); //save the best player of thisthis.gen
    this.killStaleSpecies(); //remove this.species which haven't improved in the last 15(ish)this.generations
    this.killBadSpecies(); //kill this.species which are so bad that they cant reproduce

    console.log(
      "generation  " +
        this.gen +
        "  species:   " +
        this.species.length +
        "  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    );

    let averageSum = this.getAvgFitnessSum();
    let children = [];
    for (let j = 0; j < this.species.length; j++) {
      //for each this.species

      children.push(this.species[j].champ.clone()); //add champion without any mutation
      let NoOfChildren =
        floor(
          (this.species[j].averageFitness / averageSum) * this.players.length
        ) - 1; //the number of children this this.species is allowed, note -1 is because the champ is already added

      for (let i = 0; i < NoOfChildren; i++) {
        //get the calculated amount of children from this this.species
        children.push(this.species[j].giveMeBaby());
      }
    }
    // setup();
    // return;
    if (children.length < this.players.length) {
      children.push(previousBest.clone());
    }
    while (children.length < this.players.length) {
      //if not enough babies (due to flooring the number of children to get a whole var)
      children.push(this.species[0].giveMeBaby()); //get babies from the best this.species
    }

    this.players = [];
    arrayCopy(children, this.players); //set the children as the current this.playersulation
    this.gen += 1;
    for (let i = 0; i < this.players.length; i++) {
      //generate networks for each of the children
      this.players[i].brain.generateNetwork();
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
  //seperate this.players into this.species based on how similar they are to the leaders of each this.species in the previousthis.gen
  speciate() {
    for (let s of this.species) {
      //empty this.species
      s.players = [];
    }
    for (let i = 0; i < this.players.length; i++) {
      //for each player
      let speciesFound = false;
      for (let s of this.species) {
        //for each this.species
        if (s.sameSpecies(this.players[i].brain)) {
          //if the player is similar enough to be considered in the same this.species
          s.addToSpecies(this.players[i]); //add it to the this.species
          speciesFound = true;
          break;
        }
      }
      if (!speciesFound) {
        //if no this.species was similar enough then add a new this.species with this as its champion
        this.species.push(new Species(this.players[i]));
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //calculates the fitness of all of the players
  calculateFitness() {
    for (let i = 1; i < this.players.length; i++) {
      this.players[i].calculateFitness();
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //sorts the players within a this.species and the this.species by their fitnesses
  sortSpecies() {
    //sort the players within a this.species
    for (let s of this.species) {
      s.sortSpecies();
    }

    //sort the this.species by the fitness of its best player
    //using selection sort like a loser
    let temp = []; //new ArrayList<Species>();
    for (let i = 0; i < this.species.length; i++) {
      let max = 0;
      let maxIndex = 0;
      for (let j = 0; j < this.species.length; j++) {
        if (this.species[j].bestFitness > max) {
          max = this.species[j].bestFitness;
          maxIndex = j;
        }
      }
      temp.push(this.species[maxIndex]);
      this.species.splice(maxIndex, 1);
      // this.species.remove(maxIndex);
      i--;
    }
    this.species = [];
    arrayCopy(temp, this.species);
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //kills all this.species which haven't improved in 15this.generations
  killStaleSpecies() {
    for (let i = 2; i < this.species.length; i++) {
      if (this.species[i].staleness >= 15) {
        // .remove(i);
        // splice(this.species, i)
        this.species.splice(i, 1);
        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //if a this.species sucks so much that it wont even be allocated 1 child for the nextthis.generation then kill it now
  killBadSpecies() {
    let averageSum = this.getAvgFitnessSum();

    for (let i = 1; i < this.species.length; i++) {
      if (
        (this.species[i].averageFitness / averageSum) * this.players.length <
        1
      ) {
        //if wont be given a single child
        // this.species.remove(i); //sad
        this.species.splice(i, 1);

        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //returns the sum of each this.species average fitness
  getAvgFitnessSum() {
    let averageSum = 0;
    for (let s of this.species) {
      averageSum += s.averageFitness;
    }
    return averageSum;
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
  //kill the bottom half of each this.species
  cullSpecies() {
    for (let s of this.species) {
      s.cull(); //kill bottom half
      s.fitnessSharing(); //also while we're at it lets do fitness sharing
      s.setAverage(); //reset averages because they will have changed
    }
  }

  massExtinction() {
    for (let i = 5; i < this.species.length; i++) {
      // this.species.remove(i); //sad
      this.species.splice(i, 1);

      i--;
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //              BATCH LEARNING
  //------------------------------------------------------------------------------------------------------------------------------------------
  //update all the players which are alive
  updateAliveInBatches() {
    let aliveCount = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (this.playerInBatch(this.players[i])) {
        if (!this.players[i].dead) {
          aliveCount++;
          this.players[i].look(); //get inputs for brain
          this.players[i].think(); //use outputs from neural network
          this.players[i].update(); //move the player according to the outputs from the neural network
          if (!showNothing && (!showBest || i == 0)) {
            this.players[i].show();
          }
          if (this.players[i].score > this.globalBestScore) {
            this.globalBestScore = this.players[i].score;
          }
        }
      }
    }

    if (aliveCount == 0) {
      this.batchNo++;
    }
  }

  playerInBatch(player) {
    for (
      let i = this.batchNo * this.worldsPerBatch;
      i < min((this.batchNo + 1) * this.worldsPerBatch, worlds.length);
      i++
    ) {
      if (player.world == worlds[i]) {
        return true;
      }
    }

    return false;
  }

  stepWorldsInBatch() {
    for (
      let i = this.batchNo * this.worldsPerBatch;
      i < min((this.batchNo + 1) * this.worldsPerBatch, worlds.length);
      i++
    ) {
      worlds[i].Step(1 / 30, 10, 10);
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //returns true if all the players in a batch are dead      sad
  batchDead() {
    for (
      let i = this.batchNo * this.playersPerBatch;
      i < min((this.batchNo + 1) * this.playersPerBatch, this.players.length);
      i++
    ) {
      if (!this.players[i].dead) {
        return false;
      }
    }
    return true;
  }
}
