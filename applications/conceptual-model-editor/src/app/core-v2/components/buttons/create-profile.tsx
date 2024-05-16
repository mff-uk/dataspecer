export const CreateProfileButton = (props: { onClickHandler?: () => void }) => {
    const { onClickHandler } = props;
    return (
        <button
            className={`hover:bg-teal-400 ${onClickHandler ? "" : "opacity-30"}`}
            title={
                onClickHandler
                    ? "create profile"
                    : "don't make profiles here, possibly find the entity and make the profile there"
            }
            onClick={onClickHandler}
        >
            🥑
        </button>
    );
};
