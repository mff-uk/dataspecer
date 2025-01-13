export const TwoWaySwitch = (props: {
    choices: [string, string];
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
        className={selected === choice ? "font-semibold" : ""}
        disabled={disabled || selected === choice}
        onClick={() => {
          onChoiceSelected(choice);
        }}
      >
        {choice}
      </button>
    );
  };

  const [choice1, choice2] = choices;

  return (
    <div>
      <ChoiceButton choice={choice1} />
      <Divider />
      <ChoiceButton choice={choice2} />
    </div>
  );
};
