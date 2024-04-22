export const OverrideFieldCheckbox = (props: {
    disabled: boolean | undefined;
    onChecked?: () => void;
    forElement: string;
}) => (
    <div>
        <input
            id={`${props.forElement}-override`}
            type="checkbox"
            disabled={props.disabled}
            onChange={props.onChecked}
        />
        <label htmlFor={`${props.forElement}-override`}>override</label>
    </div>
);
