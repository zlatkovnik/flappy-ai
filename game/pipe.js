class Pipe {
    constructor(x){
        this.x = x;
        this.gap = height / 4;
        this.w = width / 10;
        this.generateRandomPosition();
    }

    update(velocity){
        this.x -= velocity;
        console.log(this.x)
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
}