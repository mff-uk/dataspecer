import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ResourceDetailClickThrough } from "./entity-detail-dialog-clicktrough-component";

export const ScrollableResourceDetailClickThroughList = (props: {
    resources: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[];
    onResourceClicked: (
        resource:
            | SemanticModelClass
            | SemanticModelRelationship
            | SemanticModelClassUsage
            | SemanticModelRelationshipUsage
    ) => void;
    withIri?: boolean;
    detailDialogLanguage?: string;
}) => {
    const { resources, onResourceClicked, withIri, detailDialogLanguage } = props;

    return (
        <ul className="flex list-none flex-row flex-wrap overflow-x-auto [&>li]:mr-2">
            {resources.map((resource) => (
                <li key={resource.id}>
                    <ResourceDetailClickThrough
                        detailDialogLanguage={detailDialogLanguage}
                        resource={resource}
                        onClick={() => onResourceClicked(resource)}
                        withIri={withIri}
                    />
                </li>
            ))}
        </ul>
    );
};
