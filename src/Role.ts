import { Rectangle } from "./Shape";

export default class Role {
    public element: Rectangle;
    private type: number;
    private selfX: number;
    private selfY: number;
    private selfWidth: number;
    private selfHeight: number;
    private fillColor: string;
    private weapon: number;

    constructor(x: number, y: number, type: number, color: string) {
        switch (type) {
        case 0:
            this.selfWidth = 20;
            this.selfHeight = 60;
        }
        this.selfX = x;
        this.selfY = y - this.selfHeight;
        this.type = type;
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
