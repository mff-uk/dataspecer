export const TwoWaySwitch = (props: {
    choices: string[];
    selected: string;
    onChoiceSelected: (choice: string) => void;
    disabled?: boolean;
}) => {
    const { choices, selected, onChoiceSelected, disabled } = props;

    if (choices.length == 0) {
        return <></>;
    } else if (choices.length == 1) {
        const choice = choices[0]!;
        return (
            <div>
                <button disabled={disabled} className="font-semibold" onClick={() => onChoiceSelected(choice)}>
                    {choice}
                </button>
            </div>
        );
    }

    const Divider = () => <span className="mx-2">|</span>;

    const ChoiceButton = (props: { choice: string }) => {
        const { choice } = props;
        return (
            <button
                className={selected == choice ? "font-semibold" : ""}
                disabled={disabled || selected == choice}
                onClick={() => {
                    onChoiceSelected(choice);
                }}
            >
                {choice}
            </button>
        );
    };

    return (
        <div>
            {choices
                .slice(0, 1)
                .map((choice) => <ChoiceButton choice={choice} />)
                .concat(
                    choices.slice(1).map((choice) => (
                        <>
                            <Divider />
                            <ChoiceButton choice={choice} />
                        </>
                    ))
                )}
        </div>
    );
};
