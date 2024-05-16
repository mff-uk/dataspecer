export const TwoWaySwitch = (props: {
    choices: string[];
    selected: string;
    onChoiceSelected: (choice: string) => void;
    disabled?: boolean;
}) => {
    const { choices, selected, onChoiceSelected, disabled } = props;

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

    if (choices.length == 0 || choices.length > 2) {
        return;
    } else if (choices.length == 1) {
        const choice = choices[0]!;
        return (
            <div>
                <ChoiceButton choice={choice} />
            </div>
        );
    }

    return (
        <div>
            <ChoiceButton choice={choices[0]!} />
            <Divider />
            <ChoiceButton choice={choices[1]!} />
        </div>
    );
};
