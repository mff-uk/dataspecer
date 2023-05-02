import { CimState2 } from "./cim-change-reducer";
import { Position } from "./layout/cim-layout";
import { CimClass } from "./model/cim-defs";

export interface PaperOptions {
    height?: number;
    width?: number;
    background?: string;
}

export abstract class DiaLibAdapterBuilder {
    protected mountingPoint?: Element | Text;
    protected paperOpts?: PaperOptions;
    // protected state!: CimState;
    protected state!: CimState2;
    protected diaSyncHandler!: () => any;

    constructor() {}

    mountTo(el: Element | Text | null): DiaLibAdapterBuilder {
        if (el) this.mountingPoint = el;
        return this;
    }

    paperOptions(po: PaperOptions): DiaLibAdapterBuilder {
        this.paperOpts = po;
        return this;
    }

    cimState(cimState: CimState2) {
        this.state = cimState;
        return this;
    }

    diagramSyncHandler(handler: () => any) {
        this.diaSyncHandler = handler;
        return this;
    }

    abstract build(): DiaLibAdapter;
}

export interface DiaLibAdapter {
    setCimClassClickListener(handler: (cls: CimClass) => any): void;
    syncDiaToState(): void;
    setOnCimClassPositionChangeHandler(handler: (cls: CimClass, position: Position) => any): void;
    setOnBlankPaperClickHandler(handler: () => any): void;
}
