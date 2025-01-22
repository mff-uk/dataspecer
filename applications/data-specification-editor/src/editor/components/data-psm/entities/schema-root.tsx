import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import React, { memo, useMemo, useState } from "react";
import { RowSlots } from "../base-row";
import { DataPsmObjectType, RootContext } from "../data-psm-row";

/**
 * Represents the root of a schema, so the first row in the tree.
 * todo: So far, DataPsmSchemaRoot does not exist, all data are stored in DataPsmSchema but is it planned to be implemented in the future.
 */
export const DataPsmSchemaRootItem: React.FC<{
  iri: string,
  rootIndex: number
} & RowSlots> = memo((props) => {
  const {resource} = useResource<DataPsmSchema>(props.iri);

  const cardinalityIfNotOne = resource && resource.dataPsmCardinality && (resource.dataPsmCardinality[0] !== 1 || resource.dataPsmCardinality[1] !== 1) ? resource.dataPsmCardinality : null;
  const currentXmlContainer = resource?.dataPsmCollectionTechnicalLabel ?? "root";
  const thisStartRow = <>
  {(cardinalityIfNotOne || resource?.dataPsmEnforceCollection) && <span><code>&lt;{currentXmlContainer}&gt;</code> obaluje </span>}
  {resource?.dataPsmTechnicalLabel && resource.dataPsmTechnicalLabel.length > 0 && `(${resource.dataPsmTechnicalLabel}) `}
  </>;

  const thisEndRow = <>
    {cardinalityIfNotOne && ` [${cardinalityIfNotOne[0]}..${cardinalityIfNotOne[1] ?? "*"}]`}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const endRow = props.endRow ? [...props.endRow, thisEndRow] : [thisEndRow];

  const [rootContext] = useState({contextType: "root"} as RootContext);

  const iris = useMemo(() => [props.iri], [props.iri]);

  return <>
    <DataPsmObjectType
      {...props}
      {...rootContext}
      iri={resource?.dataPsmRoots[props.rootIndex]}
      startRow={startRow}
      endRow={endRow}
      iris={iris}
    />
  </>;
});
