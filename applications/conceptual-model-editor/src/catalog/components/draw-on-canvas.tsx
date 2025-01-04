export const DrawOnCanvasButton = (props: {
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
        if (visible) {
          removeFromCanvas?.();
        } else {
          addToCanvas?.();
        }
      }}
    >
      {visible ? "👁️" : "🕶"}
    </button>
  );
};
