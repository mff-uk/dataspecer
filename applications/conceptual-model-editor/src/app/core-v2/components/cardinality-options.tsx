import { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { Dispatch, SetStateAction } from "react";
import { CardinalityOption, semanticCardinalityToOption } from "../util/relationship-utils";

export const CardinalityOptions = (props: {
    group: "source" | "target";
    defaultCard?: [number, number | null];
    setCardinality: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    disabled: boolean;
    onChange?: () => void;
}) => {
    const { defaultCard } = props;
    const defaultCardinality = semanticCardinalityToOption(defaultCard ?? null);

    const cardinalitySelected = (value: CardinalityOption) => {
        if (value == "unset") {
            props.setCardinality((prev) => ({ ...prev, cardinality: undefined }));
        } else if (value == "0x") {
            props.setCardinality((prev) => ({ ...prev, cardinality: [0, null] }));
        } else if (value == "01") {
            props.setCardinality((prev) => ({ ...prev, cardinality: [0, 1] }));
        } else if (value == "11") {
            props.setCardinality((prev) => ({ ...prev, cardinality: [1, 1] }));
        } else if (value == "1x") {
            props.setCardinality((prev) => ({ ...prev, cardinality: [1, null] }));
        } else if (value == "xx") {
            // @ts-ignore  FIXME:
            props.setCardinality((prev) => ({ ...prev, cardinality: [null, null] }));
        } else {
            alert("unknown cardinality: " + value);
        }
    };

    return (
        <div className="mx-1">
            <fieldset id={props.group} className="flex flex-row [&>input]:ml-2 [&>input]:mr-1 [&>label]:font-mono ">
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="unset"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("unset");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "unset"}
                />
                <label htmlFor="unset">unset</label>
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="0x"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("0x");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "0x"}
                />
                <label htmlFor="0x">0..*</label>
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="01"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("01");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "01"}
                />
                <label htmlFor="01">0..1</label>
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="11"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("11");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "11"}
                />
                <label htmlFor="11">1..1</label>
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="1x"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("1x");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "1x"}
                />
                <label htmlFor="1x">1..*</label>
                <input
                    disabled={props.disabled}
                    type="radio"
                    value="xx"
                    name={props.group}
                    onClick={() => {
                        cardinalitySelected("xx");
                        props.onChange?.();
                    }}
                    checked={defaultCardinality == "xx"}
                />
                <label htmlFor="xx">*..*</label>
            </fieldset>
        </div>
    );
};
