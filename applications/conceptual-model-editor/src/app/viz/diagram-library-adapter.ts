import { type Position, type ViewLayout2 } from "./layout/view-layout";
import { type Cim, CimClass } from "./model/cim-defs";

export interface PaperOptions {
    height?: number;
    width?: number;
    background?: string;
}

export abstract class DiaLibAdapterBuilder {
    protected mountingPoint?: Element | Text;
    protected paperOpts?: PaperOptions;
    protected diaSyncHandler!: () => any;
    protected adapter?: DiaLibAdapter;

    constructor() {}

    mountTo(el: Element | Text | null): DiaLibAdapterBuilder {
        if (el) this.mountingPoint = el;
        return this;
    }

    paperOptions(po: PaperOptions): DiaLibAdapterBuilder {
        this.paperOpts = po;
        return this;
    }

    diagramSyncHandler(handler: () => any) {
        this.diaSyncHandler = handler;
        return this;
    }

    abstract build(): DiaLibAdapter;

    getAdapter(): DiaLibAdapter {
        if (!this.adapter) {
            this.adapter = this.build();
            return this.adapter;
        }
        return this.adapter;
    }
}

export interface DiaLibAdapter {
    setCimClassClickListener(handler: (cls: CimClass) => any): void;
    // syncDiaToState(cimContext: CimStateContextType, viewLayoutContext: ViewLayout): void;
    setOnCimClassPositionChangeHandler(handler: (cls: CimClass, position: Position) => any): void;
    setOnBlankPaperClickHandler(handler: () => any): void;
    // drawLines(cimContext: CimStateContextType, viewLayout: ViewLayout): void;
    bobo(): void;
    sync(cims: Cim[], viewLayout: ViewLayout2, colorOfCim: (cimId: string) => string | undefined): void;
}
