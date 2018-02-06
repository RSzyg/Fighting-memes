export default class Shape {
    public element: SVGElement;
    public type: string;
    private X: number;
    private Y: number;
    private Fill: string;
    private StrokeColor: string;
    private StrokeWidth: number;

    /**
     * this.x get & set
     */
    public get x(): number {
        return this.X;
    }

    public set x(newX: number) {
        this.X = newX;
        if (this.type === "rect") {
            this.element.setAttribute("x", `${newX}`);
        } else if (this.type === "circle") {
            this.element.setAttribute("cx", `${newX}`);
        }
    }

    /**
     * this.y get & set
     */
    public get y(): number {
        return this.Y;
    }

    public set y(newY: number) {
        this.Y = newY;
        if (this.type === "rect") {
            this.element.setAttribute("y", `${newY}`);
        } else if (this.type === "circle") {
            this.element.setAttribute("cy", `${newY}`);
        }
    }

    public get fill(): string {
        return this.Fill;
    }

    public set fill(color: string) {
        this.Fill = this.element.style.fill = color;
    }

    public get strokeColor(): string {
        return this.StrokeColor;
    }

    public set strokeColor(color: string) {
        this.StrokeColor = this.element.style.stroke = color;
    }

    public get strokeWidth(): number {
        return this.StrokeWidth;
    }

    public set strokeWidth(width: number) {
        this.StrokeWidth = width;
        this.element.style.strokeWidth = `${width}`;
    }
}
