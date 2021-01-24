class Ground {
    constructor(y){
        this.y = y;
        this.animationFrame = 0;
    }

    checkCollision(player /* :Player */){
        //collision
        if(player.y + player.r > this.y){
            return true;
        }
        return false;
    }

    show(){
        // fill(255, 255, 0);
        // rect(0, this.y, width, height);
        
        
        const gnd = spriteSheet.get(groundTexCoord.x + this.animationFrame, groundTexCoord.y, groundTexCoord.w, groundTexCoord.h);
        image(gnd, 0, this.y, width + 100, groundTexCoord.w);

    }

    update(){
        if(frameCount % 2 === 0){
            this.animationFrame = (this.animationFrame + 1) % 12;
        }
    }
}