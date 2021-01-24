class Pipe {
    constructor(x){
        this.x = x;
        this.y=0;
        this.gap = height / 4;
        this.w = width / 10;
        this.generateRandomPosition();
    }

    update(velocity){
        this.x -= velocity;
        //console.log(this.x)
        if(this.x + this.w / 2 < 0){
            this.generateRandomPosition();
            this.x = width + this.w / 2;
        }
    }

    show(){
        fill(0, 255, 0);
        rect(this.x - this.w / 2, this.y + this.gap / 2, this.w, 1000);
        rect(this.x - this.w / 2, this.y - this.gap / 2 - 1000, this.w, 1000);
    }

    generateRandomPosition(){
        this.y = Math.random() * height;
        if(this.y < this.gap / 2) this.y = this.gap / 2 + 20;
        else if (this.y > height - this.gap / 2 - height / 10) this.y = height - this.gap / 2 - height / 10 - 20;
    }

    checkCollision(player){
      
        let graniceX =player.x+player.r;
        let graniceY =player.y+player.r;
        let graniceXN = player.x-player.r;
        let graniceYN= player.y-player.r;
      
        if(graniceX>this.x && graniceXN<this.x+this.w && graniceY<this.y-this.gap/2 )
        {
            return true;
        }
        if(graniceX>this.x&& graniceXN<this.x+this.w && graniceY>this.y+this.gap/2)
        {
            return true
        }
        // }else if(graniceX>this.x && graniceX<this.x+this.w && graniceYN>this.y-this.gap/2 && graniceYN<this.y+this.gap/2)
        // {
        //     return true;
        // }else if(graniceXN>this.x && graniceXN<this.x+this.w && graniceY>this.y-this.gap/2 && graniceY<this.y+this.gap/2)
        // {
        //     return true;
        // }else if(graniceXN>this.x && graniceXN<this.x+this.w && graniceYN>this.y-this.gap/2 && graniceYN<this.y+this.gap/2)
        // {
        //     return true;
        // }else{
        //     return false;
        // }
    //     f (bird.x + bird.width > pipe1.x && bird.x < pipe1.x + pipe1.width && bird.y + bird.height > pipe1.y + pipe1.gap + 5)
    // bird.alive = false;
    // if (bird.x + bird.width > pipe1.x && bird.x < pipe1.x + pipe1.width && bird.y < pipe1.y - 10)
    // bird.alive = false;
    return false;
       
      

    }
}