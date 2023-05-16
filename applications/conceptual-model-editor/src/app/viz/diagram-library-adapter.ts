import { CimState2 } from "./cim-change-reducer";
import { Position } from "./layout/cim-layout";
import { ViewLayout } from "./layout/view-layout";
import { CimClass } from "./model/cim-defs";
import { CimStateContextType } from "./utils/hooks/use-cim-context";

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
    syncDiaToState(cimContext: CimStateContextType, viewLayoutContext: ViewLayout): void;
    setOnCimClassPositionChangeHandler(handler: (cls: CimClass, position: Position) => any): void;
    setOnBlankPaperClickHandler(handler: () => any): void;
    drawLines(cimContext: CimStateContextType, viewLayout: ViewLayout): void;
}
