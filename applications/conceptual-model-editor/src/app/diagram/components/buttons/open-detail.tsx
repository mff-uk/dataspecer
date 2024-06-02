export const OpenDetailButton = (props: { onClick: () => void }) => {
    const { onClick } = props;
    return (
        <button className="ml-2 hover:bg-teal-400" title="entity detail" onClick={onClick}>
            ℹ
        </button>
    );
};
