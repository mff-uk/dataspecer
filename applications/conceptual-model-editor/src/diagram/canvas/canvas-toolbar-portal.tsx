// Basically copy pasted the edge-toolbar-portal.tsx

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useStore, type ReactFlowState } from "@xyflow/react";

const selector = (state: ReactFlowState) => state.domNode?.querySelector(".react-flow__renderer");

/**
 * Alternative to NodeToolbarPortal based on
 * https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeToolbar/NodeToolbarPortal.tsx
 *
 * We use this as a part of our implementation of CanvasToolbar.
 */
export function CanvasToolbarPortal({ children }: { children: ReactNode }) {
  const wrapperRef = useStore(selector);

  if (!wrapperRef) {
    return null;
  }

  return createPortal(children, wrapperRef);
}
