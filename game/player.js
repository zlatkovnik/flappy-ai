class Player {
    constructor(){
        this.x = width / 3;
        this.y = height / 2;
        this.r = height / 20;
        this.yVel = 0;
        this.scrollVelocity = width / 200;
        this.gravity = 0.4;
        this.flapStrength = 10;
        this.dead = false;

        this.score = 0;

        this.animationFrame = 0;

        this.pipe1 = new Pipe(width);
        this.pipe2 = new Pipe(width + width / 2 + width / 8);
        this.ground = new Ground(height - height / 10);
    }

    update(){
            //animation frame
            if(frameCount % Math.floor(map(this.scrollVelocity, width / 200, 8, 10, 4)) == 0){
                this.animationFrame = (this.animationFrame + 1) % 3;
            }
            //physics
            this.yVel += this.gravity;
            if(this.yVel > 10) this.yVel = 10;
            this.y += this.yVel;

            //if touching celling
            if(this.y - this.r < 0){
                this.y = this.r;
                this.yVel = 0;
            }
            //check if hitting ground
            if(!this.dead)
                this.dead = this.ground.checkCollision(this);
            if(!this.dead)
                this.dead= this.pipe1.checkCollision(this);
            if(!this.dead)
                this.dead= this.pipe2.checkCollision(this);

            this.pipe1.update(this.scrollVelocity);
            this.pipe2.update(this.scrollVelocity);
            this.ground.update();

            //check if score
            this.pipe1.checkIfScored(this);
            this.pipe2.checkIfScored(this);
        
    }

    show(){
    //bg
        const wrap = Math.floor(width / backgroundTexCoord.w * 3);
        for(let i = 0; i < wrap; i++){
            const bg = spriteSheet.get(backgroundTexCoord.x, backgroundTexCoord.y, backgroundTexCoord.w, backgroundTexCoord.h);
            image(bg, i * backgroundTexCoord.w * 3, 0, backgroundTexCoord.w * 3, height);
        }

        const texCoords = playerTexCoords[this.animationFrame];
        const img = spriteSheet.get(texCoords.x, texCoords.y, texCoords.w, texCoords.h);
        image(img, this.x - this.r, this.y - this.r, 2 * this.r, 2 * this.r);

        //score
        textFont(font);
        textSize(50);
        textAlign(CENTER, CENTER);
        fill(50);
        text(this.score, width / 2, height / 5);
        //pipes
        this.pipe1.show();
        this.pipe2.show();
        //ground
        this.ground.show();

        // fill(255, 0, 0);
        // ellipse(this.x, this.y, 2 * this.r);
    }

    flap(){
        this.yVel = - this.flapStrength;
    }
}