let player;
let spriteSheet;
let font;

const playerTexCoords = [
  {x: 3, y: 491, w: 18, h: 12},
  {x: 31, y: 491, w: 18, h: 12},
  {x: 59, y: 491, w: 18, h: 12}
];
const backgroundTexCoord = {x: 0, y: 0, w: 143, h: 255};
const groundTexCoord = {x: 292, y: 0, w: 167, h: 55};
const upperPipeTexCoord = {x: 56, y: 323, w: 26, h: 161};
const lowerPipeTexCoord = {x: 84, y: 323, w: 26, h: 161};

function setup() {
  createCanvas(860, 640);
  noSmooth();
  spriteSheet = loadImage("./assets/sheet.png");
  player = new Player(width / 3, height / 2, width / 200, 0.3, 7);
  font = loadFont("./assets/font.otf");
}

function draw() {
  
  if(!player.dead){
    background(220);
    player.update();
    player.show();
  }
}

function mousePressed(){
  player.flap();

  if(player.dead){
    player = new Player(width / 3, height / 2, width / 200, 0.3, 7);
  }
}