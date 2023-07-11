import { useRef, useState, useEffect } from "react";
import { useCimAdapterContext } from "../hooks/use-cim-adapter-context";
import { JointJsAdapter4 } from "../jointjs-adapters";
import { useViewLayoutContext } from "../view-layout";

export const JointVisualisation = () => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const { classes } = useCimAdapterContext();
    const { viewLayout } = useViewLayoutContext();

    const [adapter, setAdapter] = useState<JointJsAdapter4 | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const newAdapter = new JointJsAdapter4(
            new Map(),
            { w: 1000, h: 500, bg: "lightpink" },
            canvasRef.current as unknown as Element
        );
        setAdapter(newAdapter);
    }, [canvasRef]);

    useEffect(() => {
        adapter?.sync(classes, viewLayout);
    }, [classes, viewLayout]);

    return (
        <div>
            <button
                className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => adapter?.sync(classes, viewLayout)}
            >
                sync viz
            </button>
            <button
                className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => {
                    const svg = canvasRef.current?.getElementsByTagName("svg")?.item(0);
                    console.log(svg);
                    if (svg) {
                        console.log("export to svg triggered");
                    }
                }}
            >
                export viz
            </button>
            <div id="canvas" className="h-[500px] w-full bg-amber-50" ref={canvasRef} />
        </div>
    );
};
