export const AddConceptRow = (props: { onClick: () => void }) => {
    const { onClick } = props;
    return (
        <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap pb-1 pt-0.5">
            Add a concept
            <button className="ml-2 bg-teal-300 px-1" onClick={onClick}>
                Add
            </button>
        </div>
    );
};
