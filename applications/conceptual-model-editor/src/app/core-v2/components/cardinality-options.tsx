import { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { Dispatch, SetStateAction } from "react";
import { CardinalityOption, semanticCardinalityToOption } from "../util/relationship-utils";
import { OverrideFieldCheckbox } from "./input/override-field-checkbox";

const cardinalityOptionToCardinalityMap: {
    [K in CardinalityOption]: [number, number | null] | undefined;
} = {
    unset: undefined,
    "0x": [0, null],
    "01": [0, 1],
    "11": [1, 1],
    "1x": [1, null],
    //@ts-ignore
    xx: [null, null],
};

const cardinalityOptionToStringMap: {
    [K in CardinalityOption]: string;
} = {
    unset: "unset",
    "0x": "0..*",
    "01": "0..1",
    "11": "1..1",
    "1x": "1..*",
    //@ts-ignore
    xx: "*..*",
};

const CardinalityOptionElement = (props: {
    group: string;
    value: CardinalityOption;
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

export const CardinalityOptions = (props: {
    group: "source" | "target";
    defaultCard?: [number, number | null];
    setCardinality: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    disabled: boolean;
    onChange?: () => void;
    withOverride?: boolean;
}) => {
    const { group, defaultCard, disabled, onChange, withOverride } = props;
    const defaultCardinality = semanticCardinalityToOption(defaultCard ?? null);

    const cardinalitySelected = (value: CardinalityOption) => {
        props.setCardinality((prev) => ({ ...prev, cardinality: cardinalityOptionToCardinalityMap[value] }));
    };

    return (
        <div className="flex flex-row">
            <fieldset id={props.group} className="flex flex-grow flex-row">
                {(["unset", "0x", "01", "11", "1x", "xx"] as CardinalityOption[]).map((k) => (
                    <CardinalityOptionElement
                        group={group}
                        checked={defaultCardinality == k}
                        disabled={disabled}
                        value={k as CardinalityOption}
                        onSelected={() => {
                            cardinalitySelected(k as CardinalityOption);
                            onChange?.();
                        }}
                    />
                ))}
            </fieldset>
            {withOverride && (
                <OverrideFieldCheckbox forElement={group + "override"} disabled={!disabled} onChecked={onChange} />
            )}
        </div>
    );
};
