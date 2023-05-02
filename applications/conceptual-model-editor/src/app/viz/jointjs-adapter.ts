import { PimHeaderedRectangle, cimClassToPimHeaderedRectangle2 } from "./cim-to-graph-adapter";
import { DiaLibAdapter, DiaLibAdapterBuilder, PaperOptions } from "./diagram-library-adapter";
import * as joint from "jointjs/dist/joint";
import { CimClass } from "./model/cim-defs";
import { CimState2 } from "./cim-change-reducer";
import { Position } from "./layout/cim-layout";

export class JointJsAdapterBuilder extends DiaLibAdapterBuilder {
    build(): DiaLibAdapter {
        if (!this.cimState) {
            throw new Error("CimState not defined");
        }
        return new JointJsAdapter(this.state, this.diaSyncHandler, this.paperOpts, this.mountingPoint);
    }
}

export class JointJsAdapter implements DiaLibAdapter {
    graph: joint.dia.Graph;
    paper: joint.dia.Paper;
    // cimState: CimState;
    cimState: CimState2;
    syncDiagramHandler: () => any;

    // constructor(cimState: CimState, syncDiaHandler: () => any, paperOptions?: PaperOptions, mount?: Element | Text) {
    constructor(cimState: CimState2, syncDiaHandler: () => any, paperOptions?: PaperOptions, mount?: Element | Text) {
        this.cimState = cimState;
        this.syncDiagramHandler = syncDiaHandler;
        this.graph = new joint.dia.Graph();
        this.paper = new joint.dia.Paper({
            height: paperOptions?.height,
            width: paperOptions?.width,
            background: {
                color: paperOptions?.background,
            },
            model: this.graph,
            el: mount,
        });

        console.log(mount);
    }

    setCimClassClickListener(handler: (cls: CimClass) => any): void {
        this.paper.on("element:pointerclick", (elemView, event) => {
            event.stopPropagation();

            // @ts-ignore dunno why
            const cell = elemView.model as joint.dia.Element;
            if (PimHeaderedRectangle.is(cell)) {
                const element = cell as PimHeaderedRectangle;
                const cimCls = element.parentCimClass;
                handler(cimCls);
                this.updateCell(cell.id, cimCls);
            }
        });
        console.log(this);
    }

    updateCell(cellId: any, cimCls: CimClass) {
        console.log("updatecell called");
        this.graph
            .getCell(cellId)
            .attr("bodyText/text", cimCls.attributes.map((a) => `${a.name}: ${a.value}`).join("\n"));
    }

    syncDiaToState(): void {
        this.graph.clear();
        // REMAINS AFTER CHANGE FROM CimState to CimState2
        // this.graph.addCells(
        //     this.cimState.classes.map((c) => cimClassToPimHeaderedRectangle(c, this.cimState.cimLayout))
        // );

        // this.cimState.cims.forEach((cim) =>
        //     this.graph.addCells(
        //         cim.classes.map((c) => cimClassToPimHeaderedRectangleVL(c, this.cimState.viewLayout, cim))
        //     )
        // );

        this.cimState.viewLayout.elementPositionMapWithClassRef.forEach((pos, cls) => {
            this.graph.addCell(
                cimClassToPimHeaderedRectangle2(cls, pos, this.cimState.viewLayout.colorOfCim(cls.cimId)!)
            );
        });
        this.syncDiagramHandler();
    }

    setOnCimClassPositionChangeHandler(handler: (cls: CimClass, position: Position) => any): void {
        // @ts-ignore does not seem to be defined, but the docu uses it https://resources.jointjs.com/tutorial/events#graph-events
        this.graph.on("change:position", (cell) => {
            if (PimHeaderedRectangle.is(cell)) {
                const element = cell as joint.dia.Cell;
                const cimCls = (element as PimHeaderedRectangle).parentCimClass;
                const point = element.getBBox().topLeft();
                handler(cimCls, { x: point.x, y: point.y });
            }
        });
    }

    setOnBlankPaperClickHandler(handler: () => any): void {
        this.paper.on("blank:pointerclick", (event, x, y) => {
            event.stopPropagation();
            handler();
        });
    }
}
