import React, {memo, useMemo} from "react";
import {Span, sxStyles} from "../styles";
import {DataPsmInclude} from "@dataspecer/core/data-psm/model";
import {useTranslation} from "react-i18next";
import {RowSlots} from "../base-row";
import {DataPsmObjectType, IncludeContext} from "../data-psm-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

export const DataPsmIncludeItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  const {resource: include} = useResource<DataPsmInclude>(props.iri);
  const includedObject = include?.dataPsmIncludes ?? null;

  const thisStartRow = <>
    <Span sx={sxStyles.include}>{t("includes content of")}{" "}</Span>
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  const context = useMemo(() => ({
    contextType: "include",
    parentDataPsmIncludeIri: props.iri,
  } as IncludeContext), [props.iri]);

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmObjectType
      {...props}
      iri={includedObject}
      startRow={startRow}
      icon={<ContentCopyTwoToneIcon style={{verticalAlign: "middle"}} />}
      {...context}
      iris={iris}
    />
  </>;
});
