import { ViewportPortal } from "@xyflow/react";

import type { AlignmentController } from "./alignment-controller-v2";
import type { Point } from "../edge/math";

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

function HorizontalLine({ line }: { line: Point }) {
  return (
    <ViewportPortal>
      <div
        style={{
          position: "absolute",
          left: `${line.x}px`,
          top: `${line.y}px`,
          width: "20000px",
          height: "2px",
          backgroundColor: "black",
        }}
      >
      </div>
    </ViewportPortal>
  );
}

function VerticalLine({ line }: { line: Point }) {
  return (
    <ViewportPortal>
      <div
        style={{
          position: "absolute",
          left: `${line.x}px`,
          top: `${line.y}px`,
          width: "2px",
          height: "20000px",
          backgroundColor: "black",
        }}
      >
      </div>
    </ViewportPortal>
  );
}
