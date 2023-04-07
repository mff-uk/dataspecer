import React, {memo, useMemo} from "react";
import {Span, sxStyles} from "../styles";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmAttribute} from "@dataspecer/core/data-psm/model";
import {PimAttribute} from "@dataspecer/core/pim/model";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {Datatype} from "../common/Datatype";
import {getCardinalityFromResource} from "../common/cardinality";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import RemoveIcon from "@mui/icons-material/Remove";

export const DataPsmAttributeItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {resource: dataPsmAttribute} = useResource<DataPsmAttribute>(props.iri);
  const {resource: pimAttribute} = useResource<PimAttribute>(dataPsmAttribute?.dataPsmInterpretation ?? null);

  const thisStartRow = <>
    <DataPsmGetLabelAndDescription dataPsmResourceIri={props.iri}>
      {(label, description) =>
        <Span title={description} sx={sxStyles.attribute}>{label}</Span>
      }
    </DataPsmGetLabelAndDescription>

    {!!(dataPsmAttribute?.dataPsmTechnicalLabel && dataPsmAttribute.dataPsmTechnicalLabel.length) &&
      <> (<Span sx={sxStyles.technicalLabel}>{dataPsmAttribute.dataPsmTechnicalLabel}</Span>)</>
    }

    {dataPsmAttribute?.dataPsmDatatype && dataPsmAttribute.dataPsmDatatype.length && <>
      {' : '}
      <Datatype iri={dataPsmAttribute.dataPsmDatatype} sx={sxStyles.type} />
    </>}

    {pimAttribute && (" " + getCardinalityFromResource(pimAttribute))}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmBaseRow
      {...props}
      icon={<RemoveIcon style={{verticalAlign: "middle"}} />}
      startRow={startRow}
      iris={iris}
    />
  </>;
});
