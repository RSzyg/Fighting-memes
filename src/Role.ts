import Floor from "./Floor";
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
    public floor: Floor;
    public ladderY: number;
    private type: number;
    private selfX: number;
    private selfY: number;
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
            this.moveSpeed = 5;
        }
        this.floor = floor;
        this.ladderY = floor.y;
        this.selfX = this.floor.x +
        Math.floor(Math.random() * (this.floor.width - this.selfWidth));
        this.selfY = this.floor.y - this.selfHeight;
        this.type = type;
        this.upTimer = undefined;
        this.downTimer = undefined;
        this.leftTimer = undefined;
        this.rightTimer = undefined;
        this.jumpTimer = undefined;
        this.fallTimer = undefined;
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

    public get footY(): number {
        return this.selfY + this.selfHeight;
    }
}
