export const OpenDetailButton = (props: { onClick: () => void }) => {
    const { onClick } = props;
    return (
        <button className="ml-2 hover:bg-teal-400" title="Entity detail" onClick={onClick}>
            ℹ
        </button>
    );
};
