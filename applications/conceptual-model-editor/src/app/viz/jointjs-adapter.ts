import * as joint from "jointjs/dist/joint";
import type { PaperOptions } from "./diagram-library-adapter";
import type { Association, CimClass } from "./model/cim-defs";
import { type DiaLibAdapter, DiaLibAdapterBuilder } from "./diagram-library-adapter";
import type { CimStateContextType } from "./utils/hooks/use-cim-context";
import type { Position } from "./layout/cim-layout";
import { type ViewLayout, ViewStyle } from "./layout/view-layout";

export class JointJsAdapterBuilder2 extends DiaLibAdapterBuilder {
    build(): DiaLibAdapter {
        return new JointJsAdapter2(this.paperOpts, this.mountingPoint);
    }
}

export class JointJsAdapter2 implements DiaLibAdapter {
    graph: joint.dia.Graph;
    paper: joint.dia.Paper;
    cimElementsToCellsMap: Map<CimClass | Association, CimHeaderedRectangleClass>;

    constructor(paperOptions?: PaperOptions, mount?: Element | Text) {
        this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.paper = new joint.dia.Paper({
            height: paperOptions?.height,
            width: paperOptions?.width,
            background: {
                color: paperOptions?.background,
            },
            model: this.graph,
            el: mount,
            cellViewNamespace: joint.shapes,
        });
        this.cimElementsToCellsMap = new Map();
    }

    updateCell(cellId: string, cimCls: CimClass) {
        this.graph
            .getCell(cellId)
            .attr("bodyText/text", cimCls.attributes.map((a) => `${a.name}: ${a.value}`).join("\n"));
    }

    setOnCimClassPositionChangeHandler(handler: (cls: CimClass, position: Position) => any): void {
        // @ts-ignore does not seem to be defined, but the docu uses it https://resources.jointjs.com/tutorial/events#graph-events
        this.graph.on("change:position", (cell, event) => {
            // event.stopPropagation();
            // TODO: odkomentuj
            // if (CimHeaderedRectangleClass.is(cell)) {
            //     const element = cell as joint.dia.Cell;
            //     const cimCls = (element as CimHeaderedRectangleClass).parentCimClass;
            //     const point = element.getBBox().topLeft();
            //     handler(cimCls, { x: point.x, y: point.y });
            // }
        });
    }

    setCimClassClickListener(handler: (cls: CimClass) => any): void {
        this.paper.on("element:pointerclick", (elemView, event) => {
            event.stopPropagation();

            // @ts-ignore dunno why
            const cell = elemView.model as joint.dia.Element;
            // TODO: odkomentuj
            // if (CimHeaderedRectangleClass.is(cell)) {
            //     const element = cell as CimHeaderedRectangleClass;
            //     const cimCls = element.parentCimClass;
            //     console.log(`class ${cimCls.name} clicked`);
            //     handler(cimCls);
            //     this.updateCell(cell.id, cimCls);
            // }
        });
    }

    setOnBlankPaperClickHandler(handler: () => any): void {
        this.paper.on("blank:pointerclick", (event, _x, _y) => {
            event.stopPropagation();
            handler();
        });
    }

    syncDiaToState(cimContext: CimStateContextType, viewLayout: ViewLayout): void {
        this.graph.clear();
        this.cimElementsToCellsMap.clear();

        viewLayout.elementPositionMapWithClassRef.forEach((pos, cls) => {
            if (viewLayout.viewStyle === ViewStyle.UML) {
                const cimJointElem = CimHeaderedRectangleClass.fromCimClass(
                    cls,
                    pos,
                    viewLayout.colorOfCim(cls.cimId) ?? "magenta"
                );
                this.graph.addCell(cimJointElem);
                this.cimElementsToCellsMap.set(cls, cimJointElem); // ugly FIXME:
            }

            if (viewLayout.viewStyle === ViewStyle.ONTOGRAPHER) {
                const cimJointElem = CimCircleClass.fromCimClass(
                    cls,
                    pos,
                    viewLayout.colorOfCim(cls.cimId) ?? "magenta"
                );
                this.graph.addCell(cimJointElem);

                const attribsAsCircles = cimJointElem.generateAttributesAsCircles();
                attribsAsCircles.forEach((attr) => {
                    this.graph.addCell(attr);
                    this.graph.addCell(new joint.shapes.standard.Link().target(attr).source(cimJointElem));
                });

                this.cimElementsToCellsMap.set(cls, cimJointElem); // ugly FIXME:
            }
        });

        this.drawLines(cimContext, viewLayout);
    }

    drawLines(cimContext: CimStateContextType, viewLayout: ViewLayout): void {
        cimContext.cims.forEach((cim) => {
            cim.associations.forEach((assoc) => {
                const [sourceCimClass, targetCimClass] = assoc.assocEnds;
                if (!sourceCimClass || !targetCimClass) return;
                if (!viewLayout.elementPositionMapWithClassRef.has(sourceCimClass)) return;
                if (!viewLayout.elementPositionMapWithClassRef.has(targetCimClass)) return;

                const source = this.cimElementsToCellsMap.get(sourceCimClass);
                const target = this.cimElementsToCellsMap.get(targetCimClass);

                if (!source || !target) return;

                this.graph.addCell(CimAssociation.fromAssociation(source, target));
            });
        });
    }
}

type CimHeaderedRectangleClassProps = {
    parentCls: CimClass;
};

export class CimHeaderedRectangleClass extends joint.shapes.standard.HeaderedRectangle {
    private static readonly TYPE = "CimHeaderedRectangleClass";
    parentCimClass: CimClass;
    types: string[];

    constructor(props: CimHeaderedRectangleClassProps) {
        super();
        this.parentCimClass = props.parentCls;
        this.types = [CimHeaderedRectangleClass.TYPE];
    }

    static is(elem: any): elem is CimHeaderedRectangleClass {
        return elem?.types?.includes(CimHeaderedRectangleClass.TYPE) ?? false;
    }

    static fromCimClass(cls: CimClass, pos: Position, color: string) {
        const jointElem = new CimHeaderedRectangleClass({ parentCls: cls });
        jointElem.resize(150, 100);
        jointElem.attr({
            root: {
                title: "joint.shapes.standard.HeaderedRectangle",
            },
            header: {
                fill: "lightgray",
            },
            headerText: {
                text: cls.name,
            },
            bodyText: {
                text: cls.attributes.map((a) => `${a.name}: ${a.value}`).join("\n"),
            },
            body: {
                fill: color,
            },
        });

        jointElem.position(pos.x, pos.y);

        return jointElem;
    }
}

export class CimCircleClass extends joint.shapes.standard.Circle {
    private static readonly TYPE = "CimCircleClass";
    parentCimClass: CimClass;
    types: string[];

    constructor(props: CimHeaderedRectangleClassProps) {
        super();
        this.parentCimClass = props.parentCls;
        this.types = [CimCircleClass.TYPE];
    }

    generateAttributesAsCircles(): joint.shapes.standard.Circle[] {
        return this.parentCimClass.attributes.map((attr, i) => {
            const jointElem = new joint.shapes.standard.Circle();
            jointElem.resize(70, 70);
            jointElem.attr({
                root: {
                    title: "joint.shapes.standard.Circle'",
                },
                label: {
                    text: attr.name,
                },
                body: {
                    fill: "seashell",
                },
            });

            const pos = this.getBBox();

            jointElem.position(pos.x + 65 / (i + 1), pos.y - 55 / (i + 1));

            return jointElem;
        });
    }

    static is(elem: any): elem is CimCircleClass {
        return elem?.types?.includes(CimCircleClass.TYPE) ?? false;
    }

    static fromCimClass(cls: CimClass, pos: Position, color: string) {
        const jointElem = new CimCircleClass({ parentCls: cls });
        jointElem.resize(150, 100);
        jointElem.attr({
            root: {
                title: "joint.shapes.standard.Circle'",
            },
            label: {
                text: cls.name,
            },
            body: {
                fill: color,
            },
        });

        jointElem.position(pos.x, pos.y);

        return jointElem;
    }
}

export class CimAssociation extends joint.shapes.standard.Link {
    private static readonly TYPE = "CimHeaderedRectangleClass";
    types: string[];

    constructor() {
        super();
        this.types = [CimAssociation.TYPE];
    }

    static is(elem: any): elem is CimAssociation {
        return elem?.types?.includes(CimAssociation.TYPE) ?? false;
    }

    // works even for CimCircleClass, dynamic language :D
    static fromAssociation(source: CimHeaderedRectangleClass, target: CimHeaderedRectangleClass) {
        const jointElem = new CimAssociation();

        jointElem.source(source);
        jointElem.target(target);

        return jointElem;
    }
}
