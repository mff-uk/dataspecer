export const MoveViewportToEntityButton = (props: { disabled: boolean, onClick?: () => void }) => {
    return (
        <button className="hover:bg-teal-400" title="Move viewport's center on entity" onClick={props.onClick} disabled={props.disabled}>
            🎯
        </button>
    );
};
