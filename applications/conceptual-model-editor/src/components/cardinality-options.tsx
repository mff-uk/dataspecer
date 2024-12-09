import type { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { OverrideFieldCheckbox } from "./input/override-field-checkbox";
import type { WithOverrideHandlerType } from "../util/profile-utils";
import { SemanticModelRelationshipEndUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

const cardinalityOptionToCardinalityMap: {
    [K in CardinalityOptionType]: [number, number | null] | undefined;
} = {
    unset: undefined,
    "0x": [0, null],
    "01": [0, 1],
    "11": [1, 1],
    "1x": [1, null],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this really happens, cardinalities like this come from sgov
    "xx": [null, null],
};

const cardinalityOptionToStringMap: {
    [K in CardinalityOptionType]: string;
} = {
    unset: "unset",
    "0x": "0..*",
    "01": "0..1",
    "11": "1..1",
    "1x": "1..*",
    xx: "*..*",
};

const CardinalityOptionElement = (props: {
    group: string;
    value: CardinalityOptionType;
    checked?: boolean;
    disabled?: boolean;
    onSelected: () => void;
}) => {
    const { group, value, checked, disabled, onSelected } = props;
    const optionId = group + value;
    const displayName = cardinalityOptionToStringMap[value];
    return (
        <div className="mr-3">
            <input
                id={optionId}
                disabled={disabled}
                type="radio"
                value={value}
                name={props.group}
                onChange={onSelected}
                checked={checked}
            />
            <label className="ml-1 font-mono" htmlFor={props.group + value}>
                {displayName}
            </label>
        </div>
    );
};

type CardinalityOptionType = "unset" | "0x" | "01" | "11" | "1x" | "xx";

export const CardinalityOptions = (props: {
    group: "source" | "target";
    defaultCard?: [number, number | null] | null;
    setCardinality: (setter: <T = SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage>(prev: T) => T) => void;
    disabled: boolean;
    onChange?: () => void;
    withOverride?: WithOverrideHandlerType;
}) => {
    const { group, defaultCard, disabled, onChange, withOverride } = props;
    const defaultCardinality = semanticCardinalityToOption(defaultCard ?? null);

    const cardinalitySelected = (value: CardinalityOptionType) => {
        // @ts-ignore We need to add one version for a profile and one for relationship.
        props.setCardinality((prev) => ({ ...prev, cardinality: cardinalityOptionToCardinalityMap[value] as any }));
    };

    return (
        <div className="flex flex-row">
            <fieldset id={props.group} className="flex flex-grow flex-row">
                {(["unset", "0x", "01", "11", "1x"] as CardinalityOptionType[]).map((k) => (
                    <CardinalityOptionElement
                        key={k + group}
                        group={group}
                        checked={defaultCardinality == k}
                        disabled={disabled}
                        value={k}
                        onSelected={() => {
                            cardinalitySelected(k);
                            onChange?.();
                        }}
                    />
                ))}
            </fieldset>
            {withOverride && (
                <OverrideFieldCheckbox
                    forElement={group + "override"}
                    onChecked={withOverride.callback}
                    defaultChecked={withOverride.defaultValue}
                />
            )}
        </div>
    );
};

const semanticCardinalityToOption = (v: null | [number, number | null]): CardinalityOptionType => {
    if (v == null) {
        return "unset";
    } else if (v[0] == 0 && v[1] == null) {
        return "0x";
    } else if (v[0] == 1 && v[1] == null) {
        return "1x";
    } else if (v[0] == 0 && v[1] == 1) {
        return "01";
    } else if (v[0] == 1 && v[1] == 1) {
        return "11";
    } else if (v[0] == null && v[1] == null) {
        return "xx";
    } else {
        alert("unknown cardinality option for [" + v[0].toString() + "," + (v[1]?.toString() ?? ""));
        return "unset";
    }
};