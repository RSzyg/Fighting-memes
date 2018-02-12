export default class Weapon {
    public image: SVGImageElement; // main part
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
    public imagesrc: string;

    private selfType: number; // weapon type
    private selfX: number; // x coordinate
    private selfY: number; // y coordinate
    private selfWidth: number;
    private selfHeight: number;

    constructor(type: number, x: number, y: number) {
        this.image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        switch (type) {
            case 0 :
                this.selfY = y;
                this.selfType = type;
                this.selfX = x;
                this.selfWidth = 100;
                this.selfHeight = 100;
                this.weight = 0;
                this.xMoveSpeed = this.xPower = 50;
                this.yMoveSpeed = this.yPower = 0;
                this.imagesrc = "resource/weapon/weapon_zerp.png";
                this.image.href.baseVal = this.imagesrc;
                this.image.setAttribute("x", `${this.x}`);
                this.image.setAttribute("y", `${this.y}`);
                this.image.setAttribute("width", `${this.selfWidth}`);
                this.image.setAttribute("height", `${this.selfHeight}`);
                break;
            }
    }

    public get x(): number {
        return this.selfX;
    }

    public set x(newX: number) {
        this.selfX = newX;
        this.image.setAttribute("x", `${newX}`);
    }

    public get y(): number {
        return this.selfY;
    }

    public set y(newY: number) {
        this.selfY = newY;
        this.image.setAttribute("y", `${newY}`);
        }

    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
        this.selfWidth  = newWidth;
        this.image.setAttribute("width", `${newWidth}`);
    }

    public get height(): number {
        return this.selfHeight;
    }

    public set height(newHeight: number) {
        this.selfHeight = newHeight;
        this.image.setAttribute("height", `${newHeight}`);
    }
}



