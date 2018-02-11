import Floor from "./Floor";
import Rectangle from "./Rectangle";
import Weapon from "./Weapon";


export default class Role {
    public element: Rectangle; // main part
    public power: number; // initial velocity
    public weight: number; // acceleration
    public moveSpeed: number; // horizontal velocity
    public jumpSpeed: number; // vertical velocity
    public upTimer: number; // "up" status recorder
    public downTimer: number; // "down" status recorder
    public leftTimer: number; // "left" status recorder
    public rightTimer: number; // "right" status recorder
    public squatTrans: boolean; // "squat" status recorder
    public verticalTimer: number; // jump && fall timer
    public floor: Floor; // the floor underfoot
    public ladderY: number; // the ladder be located
    public weapon: Weapon; // role's weapon
    private type: number; // role type
    private selfX: number; // x coordinate
    private selfY: number; // y coordinate
    private selfWidth: number;
    private selfHeight: number;
    private fillColor: string;

    constructor(floor: Floor, type: number, color: string) {
        switch (type) {
        case 0:
            this.selfWidth = 20;
            this.selfHeight = 60;
            this.weight = 1;
            this.jumpSpeed = this.power = 24;
            this.moveSpeed = 6;
        }
        this.floor = floor;
        this.ladderY = floor.y;
        this.selfX = this.floor.x +
        Math.floor(Math.random() * (this.floor.width - this.selfWidth));
        this.selfY = floor.y - this.height;
        this.type = type;
        this.upTimer = undefined;
        this.downTimer = undefined;
        this.leftTimer = undefined;
        this.rightTimer = undefined;
        this.verticalTimer = undefined;
        this.squatTrans = false;
        this.element = new Rectangle(
            this.selfX,
            this.selfY,
            this.selfWidth,
            this.selfHeight,
        );
        this.element.fill = color;
        // this.weapon.x = this.x;
        // this.weapon.y = this.y;
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
    /**
     * get y coordinate of foot
     */
    public get footY(): number {
        return this.selfY + this.selfHeight;
    }
    // public addWeapon(newWeapon: Weapon) {}
}
