import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useClassesContext } from "../../context/classes-context";
import { OverrideFieldCheckbox } from "./override-field-checkbox";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntityProxy } from "../../util/detail-utils";
import { WithOverrideHandlerType } from "../../util/profile-utils";

const OptionRow = (props: { resource: SemanticModelClass | SemanticModelClassUsage; duplicateNames: Set<string> }) => {
    const { resource, duplicateNames } = props;
    const { name, iri } = EntityProxy(resource);

    const displayIri = duplicateNames.has(name ?? "");

    return (
        <option value={resource.id}>
            {name} {displayIri && `(${iri})`}
        </option>
    );
};

export const SelectDomainOrRange = (props: {
    concept: string | null;
    setConcept: (resourceId: string) => void;
    onChange?: () => void;
    disabled?: boolean;
    withOverride?: WithOverrideHandlerType;
    withNullValueEnabled?: boolean;
    forElement: "domain" | "range";
}) => {
    const { concept, setConcept, onChange, disabled, withOverride, withNullValueEnabled, forElement } = props;
    const { classes2, profiles } = useClassesContext();

    const classesOrProfiles = [...classes2, ...profiles.filter(isSemanticModelClassUsage)];
    const duplicateNames = new Set(
        Object.entries(
            classesOrProfiles
                .map((c) => EntityProxy(c).name)
                .reduce((prev: { [key: string]: number }, curr) => {
                    if (!curr) {
                        return prev;
                    }
                    prev[curr] = (prev[curr] || 0) + 1;
                    return prev;
                }, {})
        )
            .filter(([name, occurance]) => occurance > 1)
            .map(([name, _]) => name)
    );

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
            <select
                className="flex-grow"
                disabled={disabled}
                onChange={(e) => {
                    if (e.target.value == "null") {
                        // @ts-ignore
                        setConcept(undefined);
                    } else {
                        setConcept(e.target.value);
                    }
                    onChange?.();
                }}
                value={value}
            >
                <option value="null" disabled={!withNullValueEnabled} selected={concept == "" || concept == null}>
                    ---
                </option>
                {classesOrProfiles.map((v) => (
                    <OptionRow key={v.id} resource={v} duplicateNames={duplicateNames} />
                ))}
            </select>
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
