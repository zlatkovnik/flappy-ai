let player;

function setup() {
  createCanvas(860, 640);

  player = new Player(width / 3, height / 2, width / 500, 0.2, 5);
}

function draw() {
  background(220);
  player.update();
  player.show();
}

function mousePressed(){
  player.flap();
}