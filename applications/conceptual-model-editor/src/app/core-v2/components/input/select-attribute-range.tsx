import { Dispatch, SetStateAction, useState } from "react";
import { AttributeRangeModificationWarning } from "../../features/warnings/attribute-range-modification-warning";
import { SelectDatatype } from "./select-datatype";
import { SelectDomainOrRange } from "./select-domain-or-range";
import { TwoWaySwitch } from "./two-way-switch";
import { OverrideFieldCheckbox } from "./override-field-checkbox";
import { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { WithOverrideHandlerType } from "../../util/profile-utils";

export const SelectAttributeRange = (props: {
    concept: string | null;
    isEnabled?: boolean;
    setRange: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    onChange?: () => void;
    withOverride?: WithOverrideHandlerType;
}) => {
    const { concept, isEnabled, onChange, setRange, withOverride } = props;
    const [keepAsAttribute, setKeepAsAttribute] = useState(true);

    return (
        <div className="flex flex-row">
            <div className="flex flex-grow flex-col">
                <div className="flex flex-row">
                    <TwoWaySwitch
                        disabled={withOverride && !isEnabled}
                        choices={["keep as attribute", "switch to relationship"]}
                        selected={keepAsAttribute ? "keep as attribute" : "switch to relationship"}
                        onChoiceSelected={(choice) => {
                            if (choice == "keep as attribute") {
                                setKeepAsAttribute(true);
                            } else {
                                setKeepAsAttribute(false);
                            }
                        }}
                    />
                    {!keepAsAttribute && <AttributeRangeModificationWarning />}
                </div>
                {keepAsAttribute ? (
                    <SelectDatatype
                        onOptionSelected={(datatype) =>
                            setRange((prev) => ({ ...prev, cardinality: undefined, concept: datatype }))
                        }
                        onChange={onChange}
                        valueSelected={concept}
                        disabled={withOverride && !isEnabled}
                    />
                ) : (
                    <SelectDomainOrRange
                        forElement="range"
                        concept={concept}
                        setConcept={(resourceId) => setRange((prev) => ({ ...prev, concept: resourceId }))}
                        onChange={onChange}
                        disabled={withOverride && !isEnabled}
                        withNullValueEnabled={true}
                    />
                )}
            </div>
            {withOverride && (
                <div className="my-auto ml-2">
                    <OverrideFieldCheckbox
                        forElement="select-datatype-component"
                        onChecked={withOverride.callback}
                        defaultChecked={withOverride.defaultValue}
                    />
                </div>
            )}
        </div>
    );
};
