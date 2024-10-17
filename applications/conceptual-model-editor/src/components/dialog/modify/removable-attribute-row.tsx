import type { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityProxy } from "../../../util/detail-utils";
import { useOptions } from "../../../application/options";

export const RemovableAttributeRow = (props: {
    attribute: SemanticModelRelationship;
    toBeRemoved: boolean;
    addToToBeRemoved: () => void;
}) => {
    const { attribute, toBeRemoved, addToToBeRemoved } = props;

    const { language } = useOptions();
    const { name, description } = EntityProxy(attribute, language);

    return (
        <div className={`flex flex-row ${toBeRemoved ? "line-through" : ""}`} title={description ?? ""}>
            {name}
            <button title="after save removes this attributes" onClick={addToToBeRemoved}>
                🗑
            </button>
        </div>
    );
};

export const RemovableAttributeProfileRow = (props: {
    attribute: SemanticModelRelationshipUsage;
    toBeRemoved: boolean;
    addToToBeRemoved: () => void;
}) => {
    const { attribute, toBeRemoved, addToToBeRemoved } = props;

    const { language } = useOptions();
    const { name, description, usageNote } = EntityProxy(attribute, language);

    return (
        <div className={`flex flex-row ${toBeRemoved ? "line-through" : ""}`} title={description ?? ""}>
            {name}
            {usageNote && (
                <div className="ml-1 bg-blue-200" title={usageNote}>
                    usage (profile?) note
                </div>
            )}
            <button title="after save removes this entity from the attributes domain" onClick={addToToBeRemoved}>
                🗑
            </button>
        </div>
    );
};
