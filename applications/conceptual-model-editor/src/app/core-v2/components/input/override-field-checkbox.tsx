export const OverrideFieldCheckbox = (props: {
    disabled?: boolean | undefined;
    onChecked?: () => void;
    forElement: string;
}) => (
    <div className="ml-2">
        <input
            id={`${props.forElement}-override`}
            type="checkbox"
            disabled={props.disabled}
            onChange={props.onChecked}
        />
        <label className="ml-0.5" htmlFor={`${props.forElement}-override`}>
            override
        </label>
    </div>
);
