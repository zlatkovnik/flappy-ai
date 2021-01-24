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
        this.pipe1 = new Pipe(width);
        this.pipe2 = new Pipe(width + width / 2 + width / 8);

        this.score = 0;

        this.animationFrame = 0;
    }

    update(){
        //animation frame
        if(frameCount % 10 === 0){
            this.animationFrame = (this.animationFrame + 1) % 3;
        }
        //physics
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
        this.ground.update();


        //check if score
        this.pipe1.checkIfScored(this);
        this.pipe2.checkIfScored(this);
    }

    show(){
        

        const bg = spriteSheet.get(backgroundTexCoord.x, backgroundTexCoord.y, backgroundTexCoord.w, backgroundTexCoord.h);
        image(bg, 0, 0, width, height);
        const texCoords = playerTexCoords[this.animationFrame];
        const img = spriteSheet.get(texCoords.x, texCoords.y, texCoords.w, texCoords.h);
        image(img, this.x - this.r, this.y - this.r, 2 * this.r, 2 * this.r);

        textFont(font);
        textSize(50);
        textAlign(CENTER, CENTER);
        text(this.score, width / 2, height / 3);

        this.pipe1.show();
        this.pipe2.show();
        this.ground.show();

        // fill(255, 0, 0);
        // ellipse(this.x, this.y, 2 * this.r);
    }

    flap(){
        this.yVel = - this.flapStrength;
    }
}