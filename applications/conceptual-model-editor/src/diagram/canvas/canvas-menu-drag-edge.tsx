import { useContext } from "react";

import { DiagramContext } from "../diagram-controller";
import { CanvasMenuContentProps } from "./canvas-menu-props";

import "./canvas-menu-drag-edge.css";
import { t } from "../../application";

/**
 * This toolbar represents menu which appears when user drags edge to canvas.
 */
export function CanvasMenuCreatedByEdgeDrag({ menuProps }: { menuProps: CanvasMenuContentProps }) {
  const context = useContext(DiagramContext);

  // We have to clean selection in every method -
  // If we don't do that then after the creation there is small moment
  // when the node menu is shown and it is slightly disruptive
  const OpenAddClassDialogWithAssociation = (isCreatedClassTarget: boolean) => {
    context?.closeCanvasMenu();
    context?.cleanSelection();
    context?.callbacks().onCanvasOpenCreateClassDialogWithAssociation(menuProps.sourceNodeIdentifier, menuProps.canvasPosition, isCreatedClassTarget);
  };

  const OpenAddClassDialogWithGeneralization = (isCreatedClassParent: boolean) => {
    context?.closeCanvasMenu();
    context?.cleanSelection();
    context?.callbacks().onCanvasOpenCreateClassDialogWithGeneralization(menuProps.sourceNodeIdentifier, menuProps.canvasPosition, isCreatedClassParent);
  };

  return <div className="flex flex-col bg-white border-2 border-slate-400 border-solid [&>*]:px-5 [&>*]:text-left">
    <button className="py-1.5 hover:bg-gray-100" onClick={() => OpenAddClassDialogWithAssociation(true)}>{t("drag-edge-to-canvas-create-association-target")}</button>
    <HorizontalSeparator></HorizontalSeparator>
    <button className="py-1.5 hover:bg-gray-100" onClick={() => OpenAddClassDialogWithAssociation(false)}>{t("drag-edge-to-canvas-create-association-source")}</button>
    <HorizontalSeparator></HorizontalSeparator>
    <button className="py-1.5 hover:bg-gray-100" onClick={() => OpenAddClassDialogWithGeneralization(true)}>{t("drag-edge-to-canvas-create-generalization-parent")}</button>
    <HorizontalSeparator></HorizontalSeparator>
    <button className="py-1.5 hover:bg-gray-100" onClick={() => OpenAddClassDialogWithGeneralization(false)}>{t("drag-edge-to-canvas-create-generalization-child")}</button>
  </div>;
}

const HorizontalSeparator = () => <hr className="h-0.5 border-none bg-slate-300" />;
