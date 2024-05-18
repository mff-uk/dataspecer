export const OverrideFieldCheckbox = (props: {
    disabled?: boolean | undefined;
    onChecked?: () => void;
    forElement: string;
    defaultChecked?: boolean;
}) => (
    <div className="ml-2">
        <input
            id={`${props.forElement}-override`}
            type="checkbox"
            disabled={props.disabled}
            onChange={props.onChecked}
            defaultChecked={props.defaultChecked}
        />
        <label className="ml-0.5" htmlFor={`${props.forElement}-override`}>
            override
        </label>
    </div>
);
