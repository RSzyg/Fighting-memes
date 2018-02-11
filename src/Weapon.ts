import Rectangle from "./Rectangle";

export default class Weapon {
    public element: Rectangle; // main part
    public attackRange: number; // index deciding if hitting the target
    public damage: number; // index showing how much it hurts
    public xPower: number; // initial horizontal velocity
    public xMoveSpeed: number; // horizontal velocity
    public yPower: number; // initial vertical velocity
    public yMoveSpeed: number; // vertical velocity
    public weight: number; // acceleration
    // public isConsumable: boolean;
    // public isMainWeapon: boolean;
    // public isItem: boolean;
    public image: SVGAElement;
    public imagesrc: string;

    private selfType: number; // weapon type
    private selfX: number; // x coordinate
    private selfY: number; // y coordinate
    private selfWidth: number;
    private selfHeight: number;

    constructor(type: number, x: number, y: number) {
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        switch (type) {
            case 0 :
                this.selfY = y;
                this.selfType = type;
                this.selfX = x;
                this.selfWidth = 100;
                this.selfWidth = 100;
                this.element = new Rectangle(x, y, this.selfWidth, this.selfWidth);
                // this.element.fill = "transparent";
                this.weight = 0;
                this.xMoveSpeed = this.xPower = 50;
                this.yMoveSpeed = this.yPower = 0;
                this.imagesrc = "resource/weapon/weapon_zero.png";
                image.setAttribute("xlink:href", this.imagesrc);
                image.setAttribute("x", `${this.x}px`);
                image.setAttribute("y", `${this.y}px`);
                image.setAttribute("width", `${this.width}px`);
                image.setAttribute("height", `${this.height}px`);
                break;
            }
        console.log(image);
        this.element.add(image);
    }

    public get x(): number {
        return this.selfX;
    }

    public set x(newX: number) {
        this.selfX = this.element.x = newX;
    }

    public get y(): number {
        return this.selfY;
    }

    public set y(newY: number) {
        this.selfY = this.element.y = newY;
    }

    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
        this.selfX += (this.selfWidth - newWidth) / 2;
        this.element.x = this.selfX;
        this.selfWidth = this.element.width = newWidth;
    }

    public get height(): number {
        return this.selfHeight;
    }

    public set height(newHeight: number) {
        this.selfY += this.selfHeight - newHeight;
        this.element.y = this.selfY;
        this.selfHeight = this.element.height = newHeight;
    }
}



