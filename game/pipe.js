class Pipe {
    constructor(x){
        this.x = x;
        this.y = 0;
        this.gap = height / 3;
        this.w = width / 8;
        this.generateRandomPosition();

        this.scored = false;
    }

    update(velocity){
        this.x -= velocity;
        if(this.x + this.w < 0){
            this.generateRandomPosition();
            this.x = width + this.w / 2;
        }
    }

    show(){
        // fill(0, 255, 0);
        // rect(this.x - this.w / 2, this.y + this.gap / 2, this.w, 1000);
        // rect(this.x - this.w / 2, this.y - this.gap / 2 - 1000, this.w, 1000);

        const upper = spriteSheet.get(upperPipeTexCoord.x, upperPipeTexCoord.y, upperPipeTexCoord.w, upperPipeTexCoord.h);
        image(upper, this.x, this.y - height - this.gap / 2, this.w, height);

        const lower = spriteSheet.get(lowerPipeTexCoord.x, lowerPipeTexCoord.y, lowerPipeTexCoord.w, lowerPipeTexCoord.h);
        image(lower, this.x, this.y + this.gap / 2, this.w, height);
    }

    checkIfScored(player){
        if(!player.dead && !this.scored){
            if(player.x - player.r > this.x + this.w){
                player.score++;
                this.scored = true;
                //Speed up game
                if(player.scrollVelocity < 8)
                   player.scrollVelocity += 0.1;
            }
        }
    }

    generateRandomPosition(){
        this.y = Math.random() * height;
        this.y = map(Math.random(), 0, 1, this.gap / 2 + 20, height - this.gap / 2 - height / 10 - 20);
        this.scored = false;
    }

    checkCollision(player){
        const x = player.x - player.r;
        const y = player.y - player.r;
        const w = 2 * player.r - 10;

        //Bottom
        if (x + w > this.x && x < this.x + this.w && y + w > this.y + this.gap / 2 + 5)
            return true;
        //Top
        if (x + w > this.x && x < this.x + this.w && y < this.y - this.gap / 2 - 5)
            return true;
        return false;
    }
}