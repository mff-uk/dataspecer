import React, {memo} from "react";
import {useItemStyles} from "../PsmItemCommon";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmAttribute} from "@dataspecer/core/data-psm/model";
import {PimAttribute} from "@dataspecer/core/pim/model";
import {useToggle} from "../../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {Datatype} from "../common/Datatype";
import {getCardinalityFromResource} from "../common/cardinality";
import {DataPsmAttributeDetailDialog} from "../../detail/data-psm-attribute-detail-dialog";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import RemoveIcon from "@mui/icons-material/Remove";

export const DataPsmAttributeItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {resource: dataPsmAttribute, isLoading} = useResource<DataPsmAttribute>(props.iri);
  const {resource: pimAttribute} = useResource<PimAttribute>(dataPsmAttribute?.dataPsmInterpretation ?? null);
  const readOnly = false;

  const dialog = useToggle();
  const {t} = useTranslation("psm");
  const styles = useItemStyles();

  const thisStartRow = <>
    <DataPsmGetLabelAndDescription dataPsmResourceIri={props.iri}>
      {(label, description) =>
        <span title={description} className={styles.attribute}>{label}</span>
      }
    </DataPsmGetLabelAndDescription>

    {!!(dataPsmAttribute?.dataPsmTechnicalLabel && dataPsmAttribute.dataPsmTechnicalLabel.length) &&
      <> (<span className={styles.technicalLabel}>{dataPsmAttribute.dataPsmTechnicalLabel}</span>)</>
    }

    {dataPsmAttribute?.dataPsmDatatype && dataPsmAttribute.dataPsmDatatype.length && <>
      {' : '}
      <Datatype iri={dataPsmAttribute.dataPsmDatatype} className={styles.type} />
    </>}

    {pimAttribute && (" " + getCardinalityFromResource(pimAttribute))}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  return <>
    <DataPsmBaseRow
      {...props}
      icon={<RemoveIcon style={{verticalAlign: "middle"}} />}
      startRow={startRow}
    />
    <DataPsmAttributeDetailDialog iri={props.iri} isOpen={dialog.isOpen} close={dialog.close} />
  </>;
});
