export const RemoveButton = (props: { onClickHandler?: () => void }) => {
    const { onClickHandler } = props;
    return (
        <button className="hover:bg-teal-400" title="Remove" onClick={onClickHandler}>
            🗑
        </button>
    );
};
