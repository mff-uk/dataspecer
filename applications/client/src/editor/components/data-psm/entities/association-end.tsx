import React, {memo, useMemo} from "react";
import {Span, sxStyles} from "../styles";
import {DataPsmAssociationEnd, DataPsmClass} from "@dataspecer/core/data-psm/model";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {RowSlots} from "../base-row";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {LanguageString} from "@dataspecer/core/core";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import AccountTreeTwoToneIcon from "@mui/icons-material/AccountTreeTwoTone";
import {AssociationContext, DataPsmObjectType} from "../data-psm-row";
import {getCardinalityFromResource} from "../common/cardinality";
import {useDialog} from "../../../dialog";
import {ReplaceAssociationWithReferenceDialog} from "../replace-association-with-reference/replace-association-with-reference-dialog";
import {ReplaceAssociationEndWithReference} from "../replace-association-with-reference/replace-association-end-with-reference";
import { ExtendedSemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

const StrikeOut: React.FC<{
  children: React.ReactNode,
  strikeOut?: boolean,
}> = ({children, strikeOut}) =>
  strikeOut ? <del>{children}</del> : <>{children}</>;

export const DataPsmAssociationEndItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  //const store = useFederatedObservableStore();

  // Data PSM association end

  const {dataPsmResource: dataPsmAssociationEnd, pimResource: pimSemanticRelationship} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, SemanticModelRelationship>(props.iri);
  console.log(dataPsmAssociationEnd, pimSemanticRelationship);
  //const readOnly = false;
  const isDematerialized = !!dataPsmAssociationEnd?.dataPsmIsDematerialize;

  // PIM Association and check if it is backward association

  const isBackwardsAssociation = false; // todo: there is no way to determine this yet
  const correctEnd = pimSemanticRelationship?.ends[isBackwardsAssociation ? 0 : 1];

  const {pimResource: pimClass} = useDataPsmAndInterpretedPim<DataPsmClass, ExtendedSemanticModelClass>(dataPsmAssociationEnd?.dataPsmPart);

  const isCodelist = pimClass?.isCodelist ?? false;

  const associationPointsToIri = dataPsmAssociationEnd?.dataPsmPart ?? null;

  // We need to decide whether there is a human label on Data PSM association end or PIM association end.
  // If no, we show a label of PIM association with extra information about the direction.

  const associationEndHumanLabel: LanguageString = useMemo(() => ({...correctEnd?.name, ...dataPsmAssociationEnd?.dataPsmHumanLabel}), [correctEnd?.name, dataPsmAssociationEnd?.dataPsmHumanLabel]);
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
            <Span title={description} sx={isCodelist ? sxStyles.attribute : sxStyles.association}>{label}</Span>
          }
        </DataPsmGetLabelAndDescription>
        :
        <LanguageStringUndefineable from={correctEnd?.name ?? null}>
          {label =>
            <LanguageStringUndefineable from={correctEnd?.description ?? null}>
              {description => <>
                {isBackwardsAssociation && <strong>{t("backwards association")}{" "}</strong>}
                <Span title={description} sx={isCodelist ? sxStyles.attribute : sxStyles.association}>{label}</Span>
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
        <>(<Span sx={sxStyles.technicalLabel}>{dataPsmAssociationEnd.dataPsmTechnicalLabel}</Span>)</>
    }

    {pimSemanticRelationship && (" " + getCardinalityFromResource(pimSemanticRelationship))}
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const endRow = props.endRow ? [thisEndRow, ...props.endRow] : [thisEndRow];
  const menu = props.menu ? [thisMenu, ...props.menu] : [thisMenu];

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  const typePimClassIri = correctEnd?.concept;

  const context = useMemo(() => ({
    contextType: "association",
    parentDataPsmAssociationEndIri: props.iri,
    parentTypePimIri: typePimClassIri
  } as AssociationContext), [props.iri, typePimClassIri]);

  return <>
    <DataPsmObjectType
      {...props}
      {...context}
      iri={associationPointsToIri}
      startRow={startRow}
      endRow={endRow}
      icon={isCodelist ? <ListRoundedIcon style={{verticalAlign: "middle"}} /> : <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />}
      menu={menu}
      iris={iris}
    />

    <ReplaceDialog.Component />
  </>;
});
