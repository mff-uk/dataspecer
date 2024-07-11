export const DrawOnCanvasButton = (props: {
    visible?: boolean;
    removeFromCanvas?: () => void;
    addToCanvas?: () => void;
}) => {
    const { visible, addToCanvas, removeFromCanvas } = props;
    return (
        <button
            className="hover:bg-teal-400"
            title="add/remove from view"
            onClick={() => {
                visible ? removeFromCanvas?.() : addToCanvas?.();
            }}
        >
            {visible ? "👁️" : "🕶"}
        </button>
    );
};
