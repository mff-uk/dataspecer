import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useClassesContext } from "../../context/classes-context";
import { OverrideFieldCheckbox } from "./override-field-checkbox";
import type { WithOverrideHandlerType } from "../../util/profile-utils";
import { prepareClassAndClassUsageForSelect } from "../../service/model-service";

export const SelectDomainOrRange = (props: {
    concept: string | null;
    setConcept: (resourceId: string | null) => void;
    onChange?: () => void;
    disabled?: boolean;
    withOverride?: WithOverrideHandlerType;
    withNullValueEnabled?: boolean;
    forElement: "domain" | "range";
}) => {
    const { concept, setConcept, onChange, disabled, withOverride, withNullValueEnabled, forElement } = props;
    const { classes, profiles } = useClassesContext();

    const classesOrProfiles = [...classes, ...profiles.filter(isSemanticModelClassUsage)];
    const values = prepareClassAndClassUsageForSelect(classesOrProfiles);

    let value: string;
    if (concept == null) {
        value = "null";
    } else if (concept == "") {
        value = "null";
    } else {
        value = concept;
    }

    return (
        <div className="flex flex-row">
            <div className="flex-grow">
                <select
                    className="w-full"
                    disabled={disabled}
                    onChange={(e) => {
                        if (e.target.value == "null") {
                            setConcept(null);
                        } else {
                            setConcept(e.target.value);
                        }
                        onChange?.();
                    }}
                    value={value}
                >
                    <option value="null" disabled={!withNullValueEnabled}>
                        ---
                    </option>
                    {values.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
            {withOverride && (
                <div className="ml-2">
                    <OverrideFieldCheckbox
                        forElement={`domain-range-component-${forElement}`}
                        onChecked={withOverride.callback}
                        defaultChecked={withOverride.defaultValue}
                    />
                </div>
            )}
        </div>
    );
};
