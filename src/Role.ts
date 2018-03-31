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
    public weapon: Weapon; // role's weapon
    private selfX: number; // x coordinate
    private selfY: number; // y coordinate
    private selfWidth: number;
    private selfHeight: number;
    private fillColor: string;
    private blockX: number;
    private blockY: number;

    constructor(type: {[key: string]: number}, color: string, x: number, y: number) {
        this.selfWidth = type.width;
        this.selfHeight = type.height;
        this.weight = type.weight;
        this.power = type.power;
        this.moveSpeed = type.moveSpeed;
        this.selfX = x;
        this.selfY = y;
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

    public get i(): number {
        return this.blockX;
    }

    public set i(newX: number) {
        this.blockX = newX;
    }

    public get j(): number {
        return this.blockY;
    }

    public set j(newY: number) {
        this.blockY = newY;
    }

    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
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
}
