export const DrawOnCanvasButtonTODO = (props: {
    visible?: boolean;
    removeFromCanvas?: () => void;
    addToCanvas?: () => void;
}) => {
    const { visible, addToCanvas, removeFromCanvas } = props;
    return (
        <button
            className="hover:bg-teal-400"
            title="Add/Remove from view"
            onClick={() => {
                visible ? removeFromCanvas?.() : addToCanvas?.();
            }}
        >
            {visible ? "🧐" : "🧐"}
        </button>
    );
};
