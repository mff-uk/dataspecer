import React, {memo, useMemo} from "react";
import {useItemStyles} from "../PsmItemCommon";
import {DataPsmAssociationEnd} from "@dataspecer/core/data-psm/model";
import {PimAssociationEnd} from "@dataspecer/core/pim/model";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {usePimAssociationFromPimAssociationEnd} from "../use-pim-association-from-pim-association-end";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {LanguageString} from "@dataspecer/core/core";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import AccountTreeTwoToneIcon from "@mui/icons-material/AccountTreeTwoTone";
import {AssociationContext, DataPsmObjectType} from "../data-psm-row";
import {getCardinalityFromResource} from "../common/cardinality";
import {useDialog} from "../../../dialog";
import {ReplaceAssociationWithReferenceDialog} from "../replace-association-with-reference/replace-association-with-reference-dialog";
import {ReplaceAssociationEndWithReference} from "../replace-association-with-reference/replace-association-end-with-reference";

const StrikeOut: React.FC<{
  children: React.ReactNode,
  strikeOut?: boolean,
}> = ({children, strikeOut}) =>
  strikeOut ? <del>{children}</del> : <>{children}</>;

export const DataPsmAssociationEndItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  const styles = useItemStyles();
  const store = useFederatedObservableStore();

  // Data PSM association end

  const {dataPsmResource: dataPsmAssociationEnd, pimResource: pimAssociationEnd} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(props.iri);
  const readOnly = false;
  const isDematerialized = !!dataPsmAssociationEnd?.dataPsmIsDematerialize;

  // PIM Association and check if it is backward association

  const {resource: pimAssociation} = usePimAssociationFromPimAssociationEnd(pimAssociationEnd?.iri ?? null);
  const isBackwardsAssociation = useMemo(() => pimAssociation && pimAssociation.pimEnd[0] === pimAssociationEnd?.iri, [pimAssociation, pimAssociationEnd]);

  const isCodelist = false;

  const associationPointsToIri = dataPsmAssociationEnd?.dataPsmPart ?? null;

  // We need to decide whether there is a human label on Data PSM association end or PIM association end.
  // If no, we show a label of PIM association with extra information about the direction.

  const associationEndHumanLabel: LanguageString = useMemo(() => ({...pimAssociationEnd?.pimHumanLabel, ...dataPsmAssociationEnd?.dataPsmHumanLabel}), [pimAssociationEnd?.pimHumanLabel, dataPsmAssociationEnd?.dataPsmHumanLabel]);
  const hasHumanLabelOnAssociationEnd = Object.keys(associationEndHumanLabel).length > 0;

  const ReplaceDialog = useDialog(ReplaceAssociationWithReferenceDialog);

  const thisMenu = <>
    <ReplaceAssociationEndWithReference dataPsmAssociationEnd={props.iri} open={ReplaceDialog.open} />
  </>;

  const thisStartRow = <>
    <StrikeOut strikeOut={isDematerialized}>
      {hasHumanLabelOnAssociationEnd ?
        <DataPsmGetLabelAndDescription dataPsmResourceIri={props.iri}>
          {(label, description) =>
            <span title={description} className={isCodelist ? styles.attribute : styles.association}>{label}</span>
          }
        </DataPsmGetLabelAndDescription>
        :
        <LanguageStringUndefineable from={pimAssociation?.pimHumanLabel ?? null}>
          {label =>
            <LanguageStringUndefineable from={pimAssociation?.pimHumanDescription ?? null}>
              {description => <>
                {isBackwardsAssociation && <strong>{t("backwards association")}{" "}</strong>}
                <span title={description} className={isCodelist ? styles.attribute : styles.association}>{label}</span>
              </>}
            </LanguageStringUndefineable>
          }
        </LanguageStringUndefineable>
      }
      {": "}
    </StrikeOut>
    {isDematerialized && ` [${t("is dematerialized")}]`}
  </>;

  const thisEndRow = <>
    {" "}

    {!!(dataPsmAssociationEnd?.dataPsmTechnicalLabel && dataPsmAssociationEnd.dataPsmTechnicalLabel.length) &&
        <>(<span className={styles.technicalLabel}>{dataPsmAssociationEnd.dataPsmTechnicalLabel}</span>)</>
    }

    {pimAssociationEnd && (" " + getCardinalityFromResource(pimAssociationEnd))}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const endRow = props.endRow ? [thisEndRow, ...props.endRow] : [thisEndRow];
  const menu = props.menu ? [thisMenu, ...props.menu] : [thisMenu];

  const typePimClassIri = pimAssociationEnd?.pimPart;

  const context = useMemo(() => ({
    contextType: "association",
    parentDataPsmAssociationEndIri: props.iri,
    parentTypePimIri: typePimClassIri
  } as AssociationContext), [props.iri, typePimClassIri]);

  return <>
    <DataPsmObjectType
      {...props}
      iri={associationPointsToIri}
      startRow={startRow}
      endRow={endRow}
      icon={isCodelist ? <ListRoundedIcon style={{verticalAlign: "middle"}} /> : <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />}
      context={context}
      menu={menu}
    />

    <ReplaceDialog.Component />
  </>;
});
