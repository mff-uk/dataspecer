import { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { Dispatch, SetStateAction } from "react";

export type CardinalityOption = "unset" | "0x" | "01" | "11" | "1x" | "xx";

export const semanticCardinalityToOption = (v: null | [number, number | null]): CardinalityOption => {
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
        alert("unknown cardinality option for [" + v[0] + "," + v[1]);
        return "unset";
    }
};

export const CardinalityOptions = (props: {
    group: "source" | "target";
    defaultCard: CardinalityOption;
    setCardinality: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
}) => {
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
                    type="radio"
                    value="unset"
                    name={props.group}
                    onClick={() => cardinalitySelected("unset")}
                    checked={props.defaultCard == "unset"}
                />
                <label htmlFor="unset">unset</label>
                <input
                    type="radio"
                    value="0x"
                    name={props.group}
                    onClick={() => cardinalitySelected("0x")}
                    checked={props.defaultCard == "0x"}
                />
                <label htmlFor="0x">0..*</label>
                <input
                    type="radio"
                    value="01"
                    name={props.group}
                    onClick={() => cardinalitySelected("01")}
                    checked={props.defaultCard == "01"}
                />
                <label htmlFor="01">0..1</label>
                <input
                    type="radio"
                    value="11"
                    name={props.group}
                    onClick={() => cardinalitySelected("11")}
                    checked={props.defaultCard == "11"}
                />
                <label htmlFor="11">1..1</label>
                <input
                    type="radio"
                    value="1x"
                    name={props.group}
                    onClick={() => cardinalitySelected("1x")}
                    checked={props.defaultCard == "1x"}
                />
                <label htmlFor="1x">1..*</label>
                <input
                    type="radio"
                    value="xx"
                    name={props.group}
                    onClick={() => cardinalitySelected("xx")}
                    checked={props.defaultCard == "xx"}
                />
                <label htmlFor="xx">*..*</label>
            </fieldset>
        </div>
    );
};
