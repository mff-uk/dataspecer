import { DataTypeURIs, dataTypeUriToName } from "@dataspecer/core-v2/semantic-model/datatypes";
import { OverrideFieldCheckbox } from "./override-field-checkbox";

const OptionRow = (props: { datatype: string; selected: boolean }) => {
    const { datatype, selected } = props;
    const datatypeLabel = dataTypeUriToName(datatype);
    return (
        <option value={datatype} selected={selected}>
            {datatypeLabel} ({datatype})
        </option>
    );
};

export const SelectDatatype = (props: {
    valueSelected: string | null;
    onOptionSelected: (optionValue: string | null) => void;
    onChange?: () => void;
    disabled?: boolean;
    withOverride?: boolean;
}) => {
    const { valueSelected, onOptionSelected, onChange, disabled, withOverride } = props;

    return (
        <div className="flex flex-col md:flex-row">
            <select
                className="w-full flex-grow"
                disabled={disabled}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value == "null") {
                        onOptionSelected(null);
                    } else {
                        onOptionSelected(value);
                    }
                    onChange?.();
                }}
            >
                <option value="null">---</option>
                {DataTypeURIs.map((datatype) => (
                    <OptionRow key={datatype} datatype={datatype} selected={valueSelected == datatype} />
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
