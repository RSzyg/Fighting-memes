import { Rectangle } from "./Shape";

export class Wall {
    public element: Rectangle;
    private type: string;
    private selfX: number;
    private selfY: number;
    private selfWidth: number;
    private selfHeight: number;
    private strokeColor: string;
    private strokeWidth: number;
    private fillColor: string;

    public constructor(
        type: string,
        x: number,
        y: number,
        width: number,
        height: number,
    ) {
        this.element = new Rectangle(x, y, width, height);
        this.selfX = x;
        this.selfY = y;
        this.selfWidth = width;
        this.selfHeight = height;
        this.type = type;
    }

    public get x(): number {
        return this.selfX;
    }

    public set x(newX: number) {
        this.selfX = newX;
        this.element.x = `${newX}px`;
    }

    public get y(): number {
        return this.selfY;
    }

    public set y(newY: number) {
        this.selfY = newY;
        this.element.y = `${newY}px`;
    }

    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
        this.selfWidth = newWidth;
        this.element.width = `${newWidth}px`;
    }

    public get height(): number {
        return this.selfHeight;
    }

    public set height(newHeight: number) {
        this.selfHeight = newHeight;
        this.element.height = `${newHeight}px`;
    }

    public setStroke(color: string, width: number) {
        this.strokeColor = color;
        this.strokeWidth = width;
        this.element.style.stroke = color;
        this.element.style.strokeWidth = `${width}px`;
    }

    public setFillColor(color: string) {
        this.fillColor = color;
        this.element.style.fill = color;
    }
}