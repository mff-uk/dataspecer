import React, { useEffect } from "react";
import "./splitter.css";

interface VerticalSplitterProps {

  className?: string;

  /**
   * We expect two children.
   */
  children: React.ReactElement[];

  /**
   * Initial value of the split.
   */
  initialSize?: number;

}

/**
 * https://phuoc.ng/collection/react-drag-drop/create-resizable-split-views/
 */
export const VerticalSplitter = (props: VerticalSplitterProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftRef = React.useRef<HTMLDivElement>(null);

  console.assert(props.children.length === 2, {
    message: "Invalid number of children",
    actual: props.children.length,
  });

  const handleMouseDown = useHandleMouseDown(leftRef, containerRef);

  useEffect(() => initialize(leftRef, props.initialSize));

  return (
    <div className={"flex flex-row " + (props.className ?? "")} ref={containerRef}>
      <div ref={leftRef}>
        {props.children[0]}
      </div>
      <div
        className="splitter__divider bg-slate-300"
        onMouseDown={handleMouseDown}
      />
      <div className="grow">
        {props.children[1]}
      </div>
    </div>
  );
};

function initialize(leftRef: React.RefObject<HTMLElement | null>, initialSize: number = 20) {
  const style = leftRef?.current?.style;
  if (style === undefined) {
    return;
  }
  style.width = `${initialSize}%`;
}

/**
 * When mouse down register listeners for move and up.
 * When move we change the style of the left thus adjusting the size.
 * When up we remove the listeners ending the action.
 */
function useHandleMouseDown(leftRef: React.RefObject<HTMLElement | null>, containerRef: React.RefObject<HTMLElement | null>) {
  return React.useCallback((event: React.MouseEvent) => {
    const start = { x: event.clientX, y: event.clientY };
    const leftWidth = leftRef?.current?.getBoundingClientRect().width;

    if (leftWidth === undefined) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - start.x;
      const containerWidth = containerRef?.current?.getBoundingClientRect().width;
      const firstStyle = leftRef?.current?.style;
      if (containerWidth === undefined || firstStyle === undefined) {
        return;
      }
      const nextWidthFraction = ((leftWidth + dx) / containerWidth) * 100;
      firstStyle.width = `${nextWidthFraction}%`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);
}
