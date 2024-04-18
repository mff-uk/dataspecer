import React, {memo, useCallback, useMemo} from "react";
import {Span, sxStyles} from "../styles";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {PimClass} from "@dataspecer/core/pim/model";
import {useToggle} from "../../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {useDialog} from "../../../dialog";
import {AddInterpretedSurroundingsDialog, WikidataAddInterpretedSurroundingsDialog} from "../../add-interpreted-surroundings";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {CreateInclude} from "../../../operations/create-include";
import {DataPsmClassAddSurroundingsButton} from "../class/DataPsmClassAddSurroundingsButton";
import {MenuItem} from "@mui/material";
import {DataPsmClassSubtree} from "../subtrees/class-subtree";
import {ReplaceAlongInheritanceDialog} from "../replace-along-inheritance/replace-along-inheritance-dialog";
import {InheritanceOrTree} from "../common/use-inheritance-or";
import {ObjectContext} from "../data-psm-row";
import {AddSpecializationDialog} from "../add-specialization/add-specialization-dialog";
import {WikidataAdapter} from "@dataspecer/wikidata-experimental-adapter";

export const DataPsmClassItem: React.FC<{
  iri: string,
  inheritanceOrTree?: InheritanceOrTree
} & RowSlots & ObjectContext> = memo((props) => {
  const {t} = useTranslation("psm");

  const {dataPsmResource: dataPsmClass, pimResource: pimClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(props.iri);
  const readOnly = false;
  const cimClassIri = pimClass?.pimInterpretation;

  const isWikidataClass = WikidataAdapter.ENTITY_URI_REGEXP.test(cimClassIri);
  const AddSurroundings = useDialog(isWikidataClass ? WikidataAddInterpretedSurroundingsDialog : AddInterpretedSurroundingsDialog, ["dataPsmClassIri"]);

  const store = useFederatedObservableStore();
  const include = useCallback(() =>
      props.iri && store.executeComplexOperation(new CreateInclude(prompt("Insert data-psm class iri") as string, props.iri))
    , [store, props.iri]);

  const collapseSubtree = useToggle(props.contextType !== "reference");

  const thisStartRow = <>
    {dataPsmClass &&
        <>
            <DataPsmGetLabelAndDescription dataPsmResourceIri={props.iri}>
              {(label, description) =>
                <Span sx={sxStyles.class} title={description}>{label}</Span>
              }
            </DataPsmGetLabelAndDescription>

          {typeof dataPsmClass.dataPsmTechnicalLabel === "string" && dataPsmClass.dataPsmTechnicalLabel.length > 0 &&
              <> (<Span sx={sxStyles.technicalLabel}>{dataPsmClass.dataPsmTechnicalLabel}</Span>)</>
          }
        </>
    }
  </>;

  const thisMenu = <>
    {cimClassIri && !readOnly && <DataPsmClassAddSurroundingsButton open={AddSurroundings.open} />}
  </>;

  const ReplaceAlongHierarchy = useDialog(ReplaceAlongInheritanceDialog);
  const AddSpecialization = useDialog(AddSpecializationDialog, ["wrappedOrIri"]);

  const thisHiddenMenu = useMemo(() => (close: () => void) => <>
    <MenuItem
      onClick={() => {
        close();
        dataPsmClass?.iri && ReplaceAlongHierarchy.open({dataPsmClassIri: dataPsmClass.iri});
      }}
      title={t("button replace along inheritance")}>
      {t("button replace along inheritance")}
    </MenuItem>
    <MenuItem
      onClick={() => {
        close();
        dataPsmClass?.iri && AddSpecialization.open({dataPsmClassIri: dataPsmClass.iri});
      }}
      title={t("button add specialization")}>
      {t("button add specialization")}
    </MenuItem>
    <MenuItem
      onClick={() => {
        close();
        include();
      }}>
      {t("Add import")}
    </MenuItem>
  </>, [t, dataPsmClass?.iri, ReplaceAlongHierarchy, AddSpecialization, include]);

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const menu = props.menu ? [thisMenu, ...props.menu] : [thisMenu];
  const hiddenMenu = props.hiddenMenu ? [...props.hiddenMenu, thisHiddenMenu] : [thisHiddenMenu];

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmBaseRow
      {...props}
      startRow={startRow}
      subtree={<DataPsmClassSubtree {...props} iri={props.iri} isOpen={collapseSubtree.isOpen} inheritanceOrTree={props.inheritanceOrTree ?? undefined} />}
      collapseToggle={collapseSubtree}
      menu={menu}
      hiddenMenu={hiddenMenu}
      iris={iris}
    />

    <AddSurroundings.Component dataPsmClassIri={props.iri} />
    <ReplaceAlongHierarchy.Component />
    <AddSpecialization.Component wrappedOrIri={props.contextType === "or" ? props.parentDataPsmOrIri : undefined} />
  </>;
});
