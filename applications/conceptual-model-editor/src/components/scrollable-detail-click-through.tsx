import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { ResourceDetailClickThrough } from "./entity-detail-dialog-clicktrough-component";
import {
  SemanticModelClassProfile,
  SemanticModelRelationshipProfile,
} from "@dataspecer/core-v2/semantic-model/profile/concepts";

export const ScrollableResourceDetailClickThroughList = (props: {
  resources: (
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassProfile
    | SemanticModelRelationshipProfile
  )[];
  onResourceClicked: (
    resource:
      | SemanticModelClass
      | SemanticModelRelationship
      | SemanticModelClassProfile
      | SemanticModelRelationshipProfile
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
