class Player {
    constructor(x, y, sv, g, fs){
        this.x = x;
        this.y = y;
        this.r = height / 20;
        this.yVel = 0;
        this.scrollVelocity = sv;
        this.gravity = g;
        this.flapStrength = fs;
        this.dead = false;
        this.ground = new Ground(height - height / 10);
        this.pipe1 = new Pipe(width, 20, 10);
        this.pipe2 = new Pipe(width + width / 2, 20, 10);
    }

    update(){
        this.yVel += this.gravity;
        this.y += this.yVel;

        //if touching celling
        if(this.y - this.r < 0){
            this.y = this.r;
            this.yVel = 0;
        }
        //check if hitting ground
        this.dead = this.ground.checkCollision(this);
        this.pipe1.update(this.scrollVelocity);
        this.pipe2.update(this.scrollVelocity);
    }

    show(){
        fill(255, 0, 0);
        ellipse(this.x, this.y, 2 * this.r);
        this.ground.show();
        this.pipe1.show();
        this.pipe2.show();
    }

    flap(){
        this.yVel = - this.flapStrength;
    }
}