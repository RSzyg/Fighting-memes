import { Rectangle } from "./Shape";

export default class Role {
    public element: Rectangle;
    public power: number;
    public weight: number;
    public moveSpeed: number;
    public jumpSpeed: number;
    public upTimer: number;
    public downTimer: number;
    public leftTimer: number;
    public rightTimer: number;
    public jumpTimer: number;
    public fallTimer: number;
    public weapon: number;
    public footY: number;
    private type: number;
    private selfX: number;
    private selfY: number;
    private selfWidth: number;
    private selfHeight: number;
    private fillColor: string;

    constructor(x: number, y: number, type: number, color: string) {
        switch (type) {
        case 0:
            this.selfWidth = 20;
            this.selfHeight = 60;
            this.weight = 1;
            this.jumpSpeed = this.power = 10;
            this.moveSpeed = 3;
        }
        this.selfX = x;
        this.selfY = this.footY = y - this.selfHeight;
        this.type = type;
        this.upTimer = undefined;
        this.downTimer = undefined;
        this.leftTimer = undefined;
        this.rightTimer = undefined;
        this.jumpTimer = undefined;
        this.fallTimer = undefined;
        this.element = new Rectangle(x, this.selfY, this.selfWidth, this.selfHeight);
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
        this.selfHeight = this.element.height = newHeight;
    }
}
