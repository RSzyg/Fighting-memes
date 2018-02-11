import Shape from "./Shape";

export default class Rectangle extends Shape {
    private Width: number;
    private Height: number;

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.type = "rect";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * this.width get & set
     */
    public get width(): number {
        return this.Width;
    }

    public set width(newWidth: number) {
        this.Width = newWidth;
        this.element.setAttribute("width", `${newWidth}`);
    }

    /**
     * this.height get & set
     */
    public get height(): number {
        return this.Height;
    }

    public set height(newHeight: number) {
        this.Height = newHeight;
        this.element.setAttribute("height", `${newHeight}`);
    }
    /**
     * add background image of a rect
     */
    public add(image: SVGImageElement) {
        this.element.appendChild(image);
    }
}
