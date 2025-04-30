export const OverrideFieldCheckbox = (props: {
    disabled?: boolean | undefined;
    onChecked?: () => void;
    forElement: string;
    defaultChecked?: boolean;
}) => (
  <div className="ml-2 flex flex-row flex-nowrap">
    <input
      id={`${props.forElement}-override`}
      type="checkbox"
      disabled={props.disabled}
      onChange={props.onChecked}
      defaultChecked={props.defaultChecked}
    />
    <label className="ml-0.5 text-nowrap" htmlFor={`${props.forElement}-override`}>
      change in profile
    </label>
  </div>
);
