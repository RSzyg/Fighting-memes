import { Rectangle } from "./Shape";
export class Floor {
    public element: Rectangle;
    private type: string;
    private selfX: number;
    private selfy: number;
    private selfwidth: number;
    private selfheight: number;
    private fillColor: string;
    private strokeColor: string;
    private strokeWidth: number;

    constructor(x: number, y: number, width: number, height: number, type: string) {
        this.element = new Rectangle(x, y, width, height);
        this.selfX = x;
        this.selfy = y;
        this.selfwidth = width;
        this.selfheight = height;
        this.type = type;
    }

    public get x(): number {
        return this.selfX;
    }

    public set x(newX: number) {
        this.selfX = newX;
        this.element.element.setAttribute("x", `${newX}px`);
    }

    public get y(): number {
        return this.selfy;
    }

    public set y(newY: number) {
        this.selfy = newY;
        this.element.element.setAttribute("y", `${newY}px`);
    }

    public get width(): number {
        return this.selfwidth;
    }

    public set width(newWidth: number) {
        this.selfwidth = newWidth;
        this.element.element.setAttribute("width", `${newWidth}px`);
    }

    public get height(): number {
        return this.selfheight;
    }

    public set height(newHeight: number) {
        this.selfheight = newHeight;
        this.element.element.setAttribute("height", `${newHeight}px`);
    }

    public setStroke(color: string, width: number) {
        this.strokeColor = color;
        this.strokeWidth = width;
        this.element.element.style.stroke = color;
        this.element.element.style.strokeWidth = `${width}px`;
    }

    public setFillColor(color: string) {
        this.fillColor = color;
        this.element.element.style.fill = color;
    }
}
