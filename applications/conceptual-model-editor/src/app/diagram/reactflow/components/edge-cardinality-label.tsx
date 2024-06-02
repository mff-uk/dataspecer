// this is a little helper component to render the actual edge label
export const CardinalityEdgeLabel = (props: { transform: string; label: string; bgColor: string | undefined }) => {
    const { label, transform, bgColor } = props;
    return (
        <div
            className="nodrag nopan absolute origin-center p-1"
            style={{ transform, backgroundColor: bgColor, pointerEvents: "all" }}
        >
            {label}
        </div>
    );
};
