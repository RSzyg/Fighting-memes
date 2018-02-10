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

    public imagesrc: string;

    private selfType: number; // weapon type
    private selfX: number; // x coordinate
    private selfY: number; // y coordinate
    private selfWidth: number;
    private selfHeight: number;

    constructor(type: number) {
        switch (type) {
            case 0:
                this.selfWidth = 20;
                this.selfHeight = 20;
                this.weight = 0;
                this.xMoveSpeed = this.xPower = 50;
                this.yMoveSpeed = this.yPower = 0;
                this.imagesrc = "weapon_zero.jpg";
                // this.x
                // this.y
        }
    }
    public image() {
        return `<image xlink:
        href = ${this.image}
        x = ${this.x}
        y = ${this.y}
        height = ${this.height}
        width = ${this.width}
        />`;
        // this.element.appendChild(image);
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



