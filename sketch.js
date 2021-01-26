let player;
let population;

let spriteSheet;
let font;

let nextConnectionNo = 1000;

const playerTexCoords = [
  { x: 3, y: 491, w: 18, h: 12 },
  { x: 31, y: 491, w: 18, h: 12 },
  { x: 59, y: 491, w: 18, h: 12 },
];
const backgroundTexCoord = { x: 0, y: 0, w: 143, h: 255 };
const groundTexCoord = { x: 292, y: 0, w: 167, h: 55 };
const upperPipeTexCoord = { x: 56, y: 323, w: 26, h: 161 };
const lowerPipeTexCoord = { x: 84, y: 323, w: 26, h: 161 };

function preload(){
  spriteSheet = loadImage("./assets/sheet.png");
  font = loadFont("./assets/font.otf");
}

function setup() {
  createCanvas(860, 640);
  noSmooth();
  flapSound.amp(0.3);
  player = new Brain(width / 3, height / 2, width / 200, 0.4, 10);
  population = new Population(1000);
}

function draw() {
  background(220);
  //Population
  if (!population.done()) population.updateAlive();
  else {
    pipe1 = new Pipe(width);
    pipe2 = new Pipe(width + width / 2 + width / 8);
    population.naturalSelection();
  }
}

function mousePressed() {
  player.flap();

  if (player.dead) {
    player = new Brain(width / 3, height / 2, width / 200, 0.4, 7);
    pipe1 = new Pipe(width);
    pipe2 = new Pipe(width + width / 2 + width / 8);
    ground = new Ground(height - height / 10);
  }
}
