import { DataTypeURIs, dataTypeUriToName } from "@dataspecer/core-v2/semantic-model/datatypes";
import { OverrideFieldCheckbox } from "./override-field-checkbox";

export const SelectDatatype = (props: {
    valueSelected: string | null;
    onOptionSelected: (optionValue: string | null) => void;
    onChange?: () => void;
    disabled?: boolean;
    withOverride?: boolean;
}) => {
  const { valueSelected, onOptionSelected, onChange, disabled, withOverride } = props;

  const values: {
        id: string;
        label: string;
    }[] = DataTypeURIs.map(iri => ({
      id: iri,
      label: dataTypeUriToName(iri) ?? iri,
    }));
  values.sort((left, right) => left.label.localeCompare(right.label));

  return (
    <div className="flex flex-col md:flex-row">
      <select
        className="w-full flex-grow"
        disabled={disabled}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "null") {
            onOptionSelected(null);
          } else {
            onOptionSelected(value);
          }
          onChange?.();
        }}
        value={valueSelected ?? "null"}
      >
        <option value="null">---</option>
        {values.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {withOverride && (
        <div className="md:my-auto md:ml-2">
          <OverrideFieldCheckbox
            forElement="select-datatype-component"
            disabled={!disabled}
            onChecked={onChange}
          />
        </div>
      )}
    </div>
  );
};
