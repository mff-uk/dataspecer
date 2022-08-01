import React, {memo, useState} from "react";
import {DataPsmClassReference} from "@dataspecer/core/data-psm/model";
import {useTranslation} from "react-i18next";
import {RowSlots} from "../base-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmObjectType, RootContext} from "../data-psm-row";

export const DataPsmReferenceItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");

  const {resource} = useResource<DataPsmClassReference>(props.iri);

  const thisStartRow = <>
    [{t("refers to")}]{" "}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  const [context] = useState({contextType: "root"} as RootContext);

  return <>
    <DataPsmObjectType
      {...props}
      iri={resource?.dataPsmClass ?? null}
      startRow={startRow}
      {...context}
    />
  </>;
});
