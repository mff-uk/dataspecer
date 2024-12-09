import { t } from "../../../application";

export const OverrideCheckbox = (props: {
  value: boolean,
  onToggle: () => void;
  disabled?: boolean,
}) => (
  <div className="ml-2 flex flex-row flex-nowrap">
    <label className="ml-0.5 text-nowrap">
      <input
        type="checkbox"
        onChange={props.onToggle}
        checked={props.value}
        disabled={props.disabled}
      />
      &nbsp;
      {t("change-in-profile")}
    </label>
  </div>
);
