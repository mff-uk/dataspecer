import React, {memo, useMemo} from "react";
import {useItemStyles} from "../styles";
import {DataPsmExternalRoot} from "@dataspecer/core/data-psm/model";
import {PimClass} from "@dataspecer/core/pim/model";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {ObjectContext} from "../data-psm-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";

export const DataPsmExternalRootItem: React.FC<{
  iri: string
} & RowSlots & ObjectContext> = memo((props) => {
  const styles = useItemStyles();

  const {resource: dataPsmExternalRoot} = useResource<DataPsmExternalRoot>(props.iri);
  const {resource: pimClass} = useResource<PimClass>(dataPsmExternalRoot?.dataPsmTypes[0]);


  const thisStartRow = <>
    {dataPsmExternalRoot &&
        <>
          <LanguageStringUndefineable from={pimClass?.pimHumanLabel}>
            {label =>
                <LanguageStringUndefineable from={pimClass?.pimHumanDescription}>
                  {description =>
                      <span className={styles.class} title={description}>{label}</span>
                  }
                </LanguageStringUndefineable>
            }
          </LanguageStringUndefineable> [mimo Dataspecer]
          {/*{typeof dataPsmExternalRoot.dataPsmTechnicalLabel === "string" && dataPsmClass.dataPsmTechnicalLabel.length > 0 &&*/}
          {/*    <> (<span className={styles.technicalLabel}>{dataPsmClass.dataPsmTechnicalLabel}</span>)</>*/}
          {/*}*/}
        </>
    }
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmBaseRow
      {...props}
      startRow={startRow}
      iris={iris}
    />
  </>;
});
