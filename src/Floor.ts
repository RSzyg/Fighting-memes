import Block from "./Block";
import Rectangle from "./Rectangle";

export default class Floor {
    private blocks: Block[];
    private selfType: string;
    private selfX: number;
    private selfY: number;
    private selfWidth: number;
    private selfHeight: number;

    constructor(x: number, y: number, width: number, height: number, type: string) {
        this.blocks = [];
        this.selfX = x;
        this.selfY = y;
        this.selfWidth = width;
        this.selfHeight = height;
        this.selfType = type;
    }

    public get x(): number {
        return this.selfX;
    }

    public get y(): number {
        return this.selfY;
    }

    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
        this.selfWidth = newWidth;
    }

    public get height(): number {
        return this.selfHeight;
    }

    public set height(newHeight: number) {
        this.selfHeight = newHeight;
    }

    public get type(): string {
        return this.selfType;
    }

    public set type(newType: string) {
        this.selfType = newType;
    }

    /**
     * addBlock
     */
    public addBlock(
        x: number,
        y: number,
        fillColor: string,
        strokeColor: string,
        strokeWidth: number,
    ) {
        const block: Block = new Block(x, y, this.selfHeight);
        block.setFillColor(fillColor);
        block.setStroke(strokeColor, strokeWidth);
        this.blocks.push(block);
        return block;
    }
}
