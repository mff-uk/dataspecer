import React, {memo, useMemo} from "react";
import {Span, sxStyles} from "../styles";
import {DataPsmExternalRoot} from "@dataspecer/core/data-psm/model";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {ObjectContext} from "../data-psm-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

export const DataPsmExternalRootItem: React.FC<{
  iri: string
} & RowSlots & ObjectContext> = memo((props) => {
  const {resource: dataPsmExternalRoot} = useResource<DataPsmExternalRoot>(props.iri);
  const {resource: pimClass} = useResource<SemanticModelClass>(dataPsmExternalRoot?.dataPsmTypes[0]);


  const thisStartRow = <>
    {dataPsmExternalRoot &&
        <>
          <LanguageStringUndefineable from={pimClass?.name}>
            {label =>
                <LanguageStringUndefineable from={pimClass?.description}>
                  {description =>
                      <Span sx={sxStyles.class} title={description}>{label}</Span>
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
