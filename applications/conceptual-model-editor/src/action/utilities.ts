import { UseDiagramType } from "../diagram/diagram-hook";
import { Selections } from "./filter-selection-action";

export const setSelectionsInDiagram = (selectionsToSetWith: Selections, diagram: UseDiagramType) => {
    diagram.actions().setSelectedNodes(selectionsToSetWith.nodeSelection);
    diagram.actions().setSelectedEdges(selectionsToSetWith.edgeSelection);
  }