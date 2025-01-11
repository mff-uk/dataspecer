import { ReactFlowState } from "@xyflow/react";

import { Position } from "../diagram-api";

import "./canvas-toolbar-general.css";

export type CanvasToolbarContentType = ({toolbarProps}: {toolbarProps: CanvasToolbarContentProps}) => JSX.Element | null;

/**
 * Represents the toolbar for general canvas. General canvas is component, which gets
 * {@link toolbarContent} and shows it on given {@link canvasPosition}.
 */
export interface CanvasToolbarGeneralProps extends CanvasToolbarContentProps {
  toolbarContent: CanvasToolbarContentType;
}

// TODO RadStr: Actually if we played with the typing a bit this could probably be probably also used for edges
//              This meaning this whole general canvnas toolbar component, but that is for future, when more stuff gets added.
/**
 * Stores the props for the content of general toolbar
 */
export interface CanvasToolbarContentProps {
  canvasPosition: Position;


  /**
   * Is the identifier of the node which caused the toolbar to appear.
   * For example when dragging edge to canvas, then it is the source node of the connection.
   * Or when clicking on action button on top of selection, then it is the lastly selected button.
   */
  sourceNodeIdentifier: string;
}

/**
 * We use this to retrieve information about viewport from the store.
 */
export const viewportStoreSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});
