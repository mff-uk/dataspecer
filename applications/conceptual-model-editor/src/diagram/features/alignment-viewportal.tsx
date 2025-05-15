import { ViewportPortal } from "@xyflow/react";
import type { AlignmentController, LineEndPointsForOrthogonal } from "./alignment-controller-v2";

/**
 * Handles rendering of the horizontal and vertical line used for node alignment helper.
 * That is when user is dragging node.
 */
export const AlignmentComponent = (controller: AlignmentController) => {
  return (
    <>
      {
        controller.horizontalAlignmentLine === null ? null :
          <HorizontalLine line={controller.horizontalAlignmentLine} />
      }
      {
        controller.verticalAlignmentLine === null ? null :
          <VerticalLine line={controller.verticalAlignmentLine} />
      }
    </>
  );
};

function HorizontalLine({ line }: { line: LineEndPointsForOrthogonal }) {
  return (
    <ViewportPortal>
      <div
        style={{
          position: "absolute",
          left: `${line.start.x}px`,
          top: `${line.start.y}px`,
          width: `${line.length}px`,
          height: "2px",
          backgroundColor: "black",
        }}
      >
      </div>
    </ViewportPortal>
  );
}

function VerticalLine({ line }: { line: LineEndPointsForOrthogonal }) {
  return (
    <ViewportPortal>
      <div
        style={{
          position: "absolute",
          left: `${line.start.x}px`,
          top: `${line.start.y}px`,
          width: "2px",
          height: `${line.length}px`,
          backgroundColor: "black",
        }}
      >
      </div>
    </ViewportPortal>
  );
}
