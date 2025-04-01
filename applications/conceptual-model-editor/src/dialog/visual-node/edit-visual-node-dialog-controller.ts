import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { EditVisualNodeDialogState } from "./edit-visual-node-dialog-state";

export const LEFT_ID = "left";

export const RIGHT_ID = "right";

export interface VisualNodeDialogStateController {

  /**
   * Change order in active section.
   */
  orderActive(source: number, destination: number): void;

  /**
   * Move item from inactive to active.
   */
  activate(source: number, destination: number): void;

  /**
   * Change order in inactive section.
   */
  orderInactive(source: number, destination: number): void;

  /**
   * Move item from active to inactive.
   */
  deactivate(source: number, destination: number): void;

}

export function useEditVisualNodeController(
  { changeState }: DialogProps<EditVisualNodeDialogState>
): VisualNodeDialogStateController {
  return useMemo(() => {

    const orderActive = (source: number, destination: number) => {
      if (source === destination) {
        return;
      }
      changeState(state => {
        const result = { ...state };
        result.activeContent = moveInArray(
          result.activeContent, source, destination);
        return result;
      })
    };

    const activate = (source: number, destination: number) =>
      changeState(state => {
        const result = { ...state };
        result.inactiveContent = [...state.inactiveContent];
        const item = result.inactiveContent.splice(source, 1);
        result.activeContent = [
          ...state.activeContent.slice(0, destination),
          ...item,
          ...state.activeContent.slice(destination),
        ];
        return result;
      });

    const orderInactive = (source: number, destination: number) => {
      if (source === destination) {
        return;
      }
      changeState(state => {
        const result = { ...state };
        result.inactiveContent =
          moveInArray(result.inactiveContent, source, destination);
        return result;
      })
    };

    const deactivate = (source: number, destination: number) =>
      changeState(state => {
        const result = { ...state };
        result.activeContent = [...state.activeContent];
        const item = result.activeContent.splice(source, 1);
        result.inactiveContent = [
          ...state.inactiveContent.slice(0, destination),
          ...item,
          ...state.inactiveContent.slice(destination),
        ];
        return result;
      });

    return {
      orderActive,
      activate,
      orderInactive,
      deactivate,
    };
  }, [changeState]);
}

/**
 * Move item in given array from source to target index.
 */
function moveInArray<T>(
  items: T[], sourceIndex: number, targetIndex: number,
): T[] {
  const result = [...items];
  // Remove from original position.
  const [movedElement] = result.splice(sourceIndex, 1);
  // Insert to target position.
  result.splice(targetIndex, 0, movedElement);
  return result;
}