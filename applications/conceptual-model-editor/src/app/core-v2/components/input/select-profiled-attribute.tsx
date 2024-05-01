import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getLocalizedStringFromLanguageString } from "../../util/language-utils";
import { getNameLanguageString, getFallbackDisplayName, getDescriptionLanguageString } from "../../util/name-utils";
import { useClassesContext } from "../../context/classes-context";
import { useConfigurationContext } from "../../context/configuration-context";
import { EntityProxy } from "../../util/detail-utils";

const OptionRow = (props: { resource: SemanticModelRelationship | SemanticModelRelationshipUsage }) => {
    const { language } = useConfigurationContext();

    const { resource } = props;
    const { name, description } = EntityProxy(resource, language);

    return (
        <option title={description ?? ""} value={resource.id}>
            {name}:{resource.id}
            {isSemanticModelAttributeUsage(resource) ? " (profile)" : ""}
        </option>
    );
};

export const SelectProfiledAttribute = (props: { onAttributeSelected: (attributeId: string) => void }) => {
    const { relationships, profiles } = useClassesContext();
    const { onAttributeSelected } = props;

    const sources = [
        ...relationships.filter(isSemanticModelAttribute),
        ...profiles.filter(isSemanticModelAttributeUsage),
    ];

    return (
        <select
            onChange={(e) => {
                onAttributeSelected(e.target.value);
            }}
        >
            <option value={undefined}>---</option>
            {sources.map((a) => (
                <OptionRow resource={a} />
            ))}
        </select>
    );
};
