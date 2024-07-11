export const AddConceptRow = (props: { onClick: () => void }) => {
    const { onClick } = props;
    return (
        <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap pb-1 pt-0.5">
            &nbsp;
            <button className="ml-2 px-1" onClick={onClick}>
                Add a new class
            </button>
        </div>
    );
};
