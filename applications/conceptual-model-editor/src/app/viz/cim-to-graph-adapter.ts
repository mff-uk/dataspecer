import * as joint from "jointjs/dist/joint";

import { Cim, CimClass } from "./model/cim-defs";
import { CimLayout, Position } from "./layout/cim-layout";
import { ViewLayout } from "./layout/view-layout";

type PimHeaderedRectangleProps = {
    parentCls: CimClass;
};

export class PimHeaderedRectangle extends joint.shapes.standard.HeaderedRectangle {
    private static readonly TYPE = "PimHeaderedRectangle";
    parentCimClass: CimClass;
    types: string[];

    constructor(props: PimHeaderedRectangleProps) {
        super();
        this.parentCimClass = props.parentCls;
        this.types = [PimHeaderedRectangle.TYPE];
    }

    static is(elem: any): elem is PimHeaderedRectangle {
        return elem.types.includes(PimHeaderedRectangle.TYPE);
    }

    getCellId() {
        return this.id;
    }
}

export const cimClassToPimHeaderedRectangle = (cls: CimClass, cimLayout: CimLayout) => {
    const jointElem = new PimHeaderedRectangle({ parentCls: cls });
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
            fill: "lightblue",
        },
    });

    const pos = cimLayout.positionOf(cls.id);
    if (pos) {
        jointElem.position(pos.x, pos.y);
    } else {
        cimLayout.setPosition(cls.id, { x: 65, y: 100 });
    }

    return jointElem;
};

export const cimClassToPimHeaderedRectangleVL = (cls: CimClass, viewLayout: ViewLayout, cim: Cim) => {
    const jointElem = new PimHeaderedRectangle({ parentCls: cls });
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
            fill: viewLayout.colorOfCim(cim.id),
        },
    });

    const pos = viewLayout.positionOf(cls.id);
    if (pos) {
        jointElem.position(pos.x, pos.y);
    } else {
        viewLayout.setPosition(cls.id, { x: 65, y: 100 });
    }

    return jointElem;
};

export const cimClassToPimHeaderedRectangle2 = (cls: CimClass, pos: Position, color: string) => {
    const jointElem = new PimHeaderedRectangle({ parentCls: cls });
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
};
