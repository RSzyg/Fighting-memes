import Rectangle from "./Rectangle";

export default class Block {
    public element: Rectangle;
    private selfX: number;
    private selfY: number;
    private selfLength: number;
    private fillColor: string;
    private strokeColor: string;
    private strokeWidth: number;

    constructor(x: number, y: number, length: number) {
        this.element = new Rectangle(x, y, length, length);
        this.selfX = x;
        this.selfY = y;
        this.selfLength = length;
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

    public get length(): number {
        return this.selfLength;
    }

    public set length(newLength: number) {
        this.selfLength = newLength;
        this.element.width = newLength;
        this.element.height = newLength;
    }

    public setStroke(color: string, width: number) {
        this.strokeColor = this.element.strokeColor = color;
        this.strokeWidth = this.element.strokeWidth = width;
    }

    public setFillColor(color: string) {
        this.fillColor = this.element.fill = color;
    }
}
