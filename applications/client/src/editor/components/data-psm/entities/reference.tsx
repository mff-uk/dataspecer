import React, {memo, useMemo, useState} from "react";
import {DataPsmClassReference} from "@dataspecer/core/data-psm/model";
import {useTranslation} from "react-i18next";
import {RowSlots} from "../base-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmObjectType, ReferenceContext} from "../data-psm-row";

export const DataPsmReferenceItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");

  const {resource} = useResource<DataPsmClassReference>(props.iri);

  const thisStartRow = <>
    [{t("refers to")}]{" "}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  const [context] = useState({contextType: "reference"} as ReferenceContext);

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmObjectType
      {...props}
      iri={resource?.dataPsmClass ?? null}
      startRow={startRow}
      {...context}
      iris={iris}
    />
  </>;
});
