import { PimClass } from "@dataspecer/core/pim/model";
import * as joint from "jointjs/dist/joint";
import { type Position } from "./view-layout";
import React, { useContext } from "react";
import { useCimAdapterContext } from "./hooks/use-cim-adapter-context";
import { ViewLayout, useViewLayoutContext } from "./view-layout";

export const JointJSAdapterWithStates = () => {};

export class JointJsAdapter4 {
    graph: joint.dia.Graph;
    newGraph?: joint.dia.Graph;
    paper: joint.dia.Paper;
    cimClassPositionMap: Map<PimClass, Position>;

    constructor(
        positionMap: Map<PimClass, Position>,
        paperOptions?: { h: number; w: number; bg: string },
        mount?: Element | Text
    ) {
        this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.newGraph = undefined;
        this.paper = new joint.dia.Paper({
            height: paperOptions?.h,
            width: paperOptions?.w,
            background: {
                color: paperOptions?.bg,
            },
            model: this.graph,
            el: mount,
            cellViewNamespace: joint.shapes,
        });
        this.cimClassPositionMap = positionMap;
    }

    sync(pimClasses: PimClass[], viewLayout: ViewLayout): void {
        console.log("syncing in joint adapter", pimClasses, this.paper);

        this.graph.clear();

        viewLayout.elementPositionMap.forEach((position, pimClass) => {
            this.graph.addCell(pimClassToJointJsHeaderedClass(pimClass, position, "magenta"));
        });
    }
}

const pimClassToJointJsHeaderedClass = (pimClass: PimClass, pos: Position, pimColor = "magenta") => {
    const jointElem = new joint.shapes.standard.HeaderedRectangle({ parentCls: pimClass });
    jointElem.resize(150, 100);
    jointElem.attr({
        root: {
            title: "joint.shapes.standard.HeaderedRectangle",
        },
        header: {
            fill: "lightgray",
        },
        headerText: {
            text: pimClass.iri ?? "noName",
        },
        bodyText: {
            text: pimClass.types.map((a, i) => `type_${i}: ${a}`).join("\n"),
        },
        body: {
            fill: pimColor,
        },
    });

    jointElem.position(pos.x, pos.y);

    return jointElem;
};

export const JointJsAdapterContext = React.createContext({
    adapter: null as unknown as JointJsAdapter4,
});

export const useJointJsAdapter = () => {
    const { adapter } = useContext(JointJsAdapterContext);
    const { classes } = useCimAdapterContext();
    const { viewLayout } = useViewLayoutContext();

    const syncState = () => {
        console.log(classes);
        console.log(adapter.sync(classes, viewLayout));
    };

    return { adapter, syncState };
};
