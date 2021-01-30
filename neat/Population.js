class Population {
  constructor(size) {
    this.players = []; //:Player[]
    this.globalBestScore = 0;
    this.gen = 1;
    this.genPlayers = []; //:Player[]
    this.species = []; //:Species[]

    this.massExtinctionEvent = false;
    this.newStage = false;

    this.gensSinceNewWorld = 0;

    for (let i = 0; i < size; i++) {
      this.players.push(new Agent());
      this.players[this.players.length - 1].brain.mutate();
      this.players[this.players.length - 1].brain.generateNetwork();
    }
  }

  updateAlive() {
    let bestPlayer;
    for (let i = 0; i < this.players.length; i++) {
      bestPlayer = this.players[i];
      if (!bestPlayer.dead) break;
    }
    bestPlayer.show();
    bestPlayer.brain.drawGenome(width / 2, 0, width / 2, height / 2, this);
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

  //true ako su svi igraci mrtvi
  done() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        return false;
      }
    }
    return true;
  }


  //zove se kada su svi igraci mrtvi (this.players) i nova generacija se pravi
  naturalSelection() {
    let previousBest = this.players[0];
    this.speciate(); //razvrstava igrace po vrstama
    this.calculateFitness(); //Racuna se fitnes svih igraca
    this.sortSpecies(); //Sortira vrste od najbolje ka najgoroj
    if (this.massExtinctionEvent) {
      this.massExtinction();
      this.massExtinctionEvent = false;
    }
    this.cullSpecies(); //Ubija donju polovinu svake vrste
    this.killStaleSpecies(); //Ubija vrste koje nisu napredovale 15 generacija
    this.killBadSpecies(); //Ubija sve ispod prosecne vrste

    console.log(
      "generation  " +
        this.gen +
        "  species:   " +
        this.species.length
    );

    const averageSum = this.getAvgFitnessSum();
    const children = [];
    for (let j = 0; j < this.species.length; j++) {
      children.push(this.species[j].champ.clone()); //Dodaje sampiona bez mutacija
      const NoOfChildren =
        floor(
          (this.species[j].averageFitness / averageSum) * this.players.length
        ) - 1; //Dozvoljen broj dece

      for (let i = 0; i < NoOfChildren; i++) {
        //Vrati bebe u odnosu na broj dece
        children.push(this.species[j].giveMeBaby());
      }
    }
    if (children.length < this.players.length) {
      children.push(previousBest.clone());
    }
    while (children.length < this.players.length) {
      //Ako nema dovoljno beba zbog zaokruzivanja
      children.push(this.species[0].giveMeBaby()); //Uzima bebe od najbolje vrste
    }

    this.players = [];
    arrayCopy(children, this.players);
    this.gen += 1;
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].brain.generateNetwork();
    }
  }

  //Podeli igrace u vrste u odnosu na to koliko se razlikuju od najboljeg u vrsti
  speciate() {
    //Reset vrsti
    for (let s of this.species) {
      s.players = [];
    }
    for (let i = 0; i < this.players.length; i++) {
      let speciesFound = false;
      for (let s of this.species) {
        if (s.sameSpecies(this.players[i].brain)) {
          //Ako je igrac dovoljno slican da pripadne toj vrsti
          s.addToSpecies(this.players[i]);
          speciesFound = true;
          break;
        }
      }
      if (!speciesFound) {
        //Ako igrac nije slican ni jednoj vrsti, dodaj ga kao sampiona nove vrste
        this.species.push(new Species(this.players[i]));
      }
    }
  }
  //Racuna fitnes svih igraca
  calculateFitness() {
    for (let i = 1; i < this.players.length; i++) {
      this.players[i].calculateFitness();
    }
  }

  //Sortira vrste po fitnesu
  sortSpecies() {
    //Sortira igrace po vrsti
    for (let s of this.species) {
      s.sortSpecies();
    }

    //Sortira vrste po fitnesu najboljeg igraca
    let temp = [];
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
      i--;
    }
    this.species = [];
    arrayCopy(temp, this.species);
  }

  //Ubija sve vrste koje nisu napredovale 15 generacija
  killStaleSpecies() {
    const species = [];
    for (let i = 2; i < this.species.length; i++) {
      if (this.species[i].staleness < 15) {
        species.push(this.species[i]);
      }
    }
    this.species = species;
  }
  
  //Ubija ispod prosecne vrste
  killBadSpecies() {
    let averageSum = this.getAvgFitnessSum();
    for (let i = 1; i < this.species.length; i++) {
      if ((this.species[i].averageFitness / averageSum) * this.players.length < 1) {
        this.species.splice(i, 1);
        i--;
      }
    }
  }

  //Vraca sumu svih prosecnih fitnesa u svim vrstama
  getAvgFitnessSum() {
    let averageSum = 0;
    for (let s of this.species) {
      averageSum += s.averageFitness;
    }
    return averageSum;
  }

  //Ubija donju polovinu svake vrste
  cullSpecies() {
    for (let s of this.species) {
      s.cull(); //Ubija donju polovinu vrste
      s.setAverage(); //Setuje prosecan fitnes
    }
  }

  massExtinction() {
    //Ostavlja samo prva pet najbolja
    const species = [];
    for(let i = 0; i < 5; i++){
      species.push(this.species[i]);
    }
    this.species = species;
  }
}