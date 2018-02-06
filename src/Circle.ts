import Shape from "./Shape";

export default class Circle extends Shape {
    private R: number;
    constructor(x: number, y: number, r: number) {
        super();
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.x = x;
        this.y = y;
        this.r = r;
    }

    public get r(): number {
        return this.R;
    }

    public set r(r: number) {
        this.R = r;
        this.element.setAttribute("r", `${r}`);
    }
}
