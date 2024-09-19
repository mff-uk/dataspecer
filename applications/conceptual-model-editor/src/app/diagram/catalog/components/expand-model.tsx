export const ExpandModelButton = (props: { isOpen: boolean; onClick: () => void }) => {
    const { isOpen, onClick } = props;
    return (
        <button title={isOpen ? "fold" : "expand"} onClick={onClick}>
            {isOpen ? "🔼" : "🔽"}
        </button>
    );
};
