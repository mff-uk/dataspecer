import type { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntityProxy } from "../../util/detail-utils";
import { useConfigurationContext } from "../../context/configuration-context";
import type { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const ClassNodeAttributeRow = (props: {
    attribute: SemanticModelRelationship | SemanticModelRelationshipUsage;
}) => {
    const { attribute } = props;
    const { language } = useConfigurationContext();
    const { name, description, usageNote, profileOf } = EntityProxy(attribute, language);
    const profiledClassName = profileOf ? EntityProxy(profileOf, language).name : null;

    return (
        <p key={attribute.id} title={description ?? ""} className="flex flex-row">
            <span>- {name}</span>
            {profiledClassName && <span>, profile of: {profiledClassName}</span>}
            {usageNote && (
                <div className="ml-2 rounded-sm bg-blue-300" title={usageNote}>
                    usage info
                </div>
            )}
        </p>
    );
};

export const ThreeDotsRow = (props: { onClickHandler: () => void }) => {
    return (
        <p key="more-than-5-attributes" className="flex flex-row" onClick={props.onClickHandler}>
            <span>- ...</span>
        </p>
    );
};
