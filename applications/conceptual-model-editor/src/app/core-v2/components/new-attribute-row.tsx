import { SemanticModelRelationship, isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntityProxy } from "../util/detail-utils";
import { useConfigurationContext } from "../context/configuration-context";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
import { getProfiledEntity } from "../util/profile-utils";
import { useClassesContext } from "../context/classes-context";

export const NewRemovableAttributeRow = (props: {
    attribute: Partial<Omit<SemanticModelRelationship, "type">>;
    deleteButtonClicked: () => void;
}) => {
    const { language } = useConfigurationContext();
    const { attribute, deleteButtonClicked } = props;

    const attr = attribute.ends?.at(1)!;
    const name = getLocalizedStringFromLanguageString(attr.name, language) ?? "no iri";
    const description = getLocalizedStringFromLanguageString(attr.description, language) ?? "";
    return (
        <div className="flex flex-row" title={description}>
            (new) {name}
            <button onClick={deleteButtonClicked}>🗑</button>
        </div>
    );
};

export const NewRemovableAttributeProfileRow = (props: {
    resource: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">;
    deleteButtonClicked: () => void;
}) => {
    const { language } = useConfigurationContext();
    const { relationships, profiles } = useClassesContext();
    const { resource, deleteButtonClicked } = props;

    const getProfiledEntityName = () => {
        const resources = [
            ...relationships.filter(isSemanticModelAttribute),
            ...profiles.filter(isSemanticModelAttributeUsage),
        ];
        const profiledEntity = getProfiledEntity(resource as SemanticModelRelationshipUsage, resources);
        if (!profiledEntity) {
            return resource.usageOf;
        }
        return EntityProxy(profiledEntity, language).name;
    };

    const attr = resource.ends?.at(1)!;
    const name = getLocalizedStringFromLanguageString(attr.name, language);
    const displayName = name ?? `nameless profile of ${getProfiledEntityName() ?? resource.usageOf}`;

    const description = getLocalizedStringFromLanguageString(attr.description, language) ?? "";
    return (
        <div className="flex flex-row" title={description}>
            (new) {displayName}
            <button onClick={deleteButtonClicked}>🗑</button>
        </div>
    );
};
