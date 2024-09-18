export const MoveViewportToEntityButton = (props: { disabled: boolean, onClick?: () => void }) => {
    return (
        <button
            className="hover:bg-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
            title="Move viewport's center on entity"
            onClick={props.onClick}
            disabled={props.disabled}
        >
            🎯
        </button>
    );
};
