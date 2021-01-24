class Ground {
    constructor(y){
        this.y = y;
    }

    checkCollision(player /* :Player */){
        //collision
        if(player.y + player.r > this.y){
            return true;
        }
        return false;
    }

    show(){
        line(0, this.y, width, this.y);
    }
}