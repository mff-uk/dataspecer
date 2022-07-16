import React, {memo, useCallback, useMemo} from "react";
import {useItemStyles} from "../PsmItemCommon";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {PimClass} from "@dataspecer/core/pim/model";
import {useToggle} from "../../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "../common/DataPsmGetLabelAndDescription";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {useDialog} from "../../../dialog";
import {DataPsmClassDetailDialog} from "../../detail/data-psm-class-detail-dialog";
import {AddInterpretedSurroundingsDialog} from "../../add-interpreted-surroundings";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {CreateInclude} from "../../../operations/create-include";
import {DataPsmClassAddSurroundingsButton} from "../class/DataPsmClassAddSurroundingsButton";
import {MenuItem} from "@mui/material";
import {Icons} from "../../../icons";
import {DataPsmClassSubtree} from "../subtrees/class-subtree";
import {ReplaceAlongInheritanceDialog} from "../replace-along-inheritance/replace-along-inheritance-dialog";

export const DataPsmClassItem: React.FC<{iri: string} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  const styles = useItemStyles();

  const {dataPsmResource: dataPsmClass, pimResource: pimClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(props.iri);
  const readOnly = false;
  const cimClassIri = pimClass?.pimInterpretation;

  const DetailDialog = useDialog(DataPsmClassDetailDialog, ["iri"]);
  const AddSurroundings = useDialog(AddInterpretedSurroundingsDialog, ["dataPsmClassIri"]);

  const store = useFederatedObservableStore();
  const include = useCallback(() =>
      props.iri && store.executeComplexOperation(new CreateInclude(prompt("Insert data-psm class iri") as string, props.iri))
    , [store, props.iri]);

  const collapseSubtree = useToggle(true);

  const thisStartRow = <>
    {dataPsmClass &&
        <>
            <DataPsmGetLabelAndDescription dataPsmResourceIri={props.iri}>
              {(label, description) =>
                <span className={styles.class} title={description}>{label}</span>
              }
            </DataPsmGetLabelAndDescription>

          {typeof dataPsmClass.dataPsmTechnicalLabel === "string" && dataPsmClass.dataPsmTechnicalLabel.length > 0 &&
              <> (<span className={styles.technicalLabel}>{dataPsmClass.dataPsmTechnicalLabel}</span>)</>
          }
        </>
    }
  </>;

  const thisMenu = <>
    {cimClassIri && !readOnly && <DataPsmClassAddSurroundingsButton open={AddSurroundings.open} />}
    {readOnly ?
      <MenuItem onClick={() => DetailDialog.open({})} title={t("button edit")}><Icons.Tree.Info/></MenuItem> :
      <MenuItem onClick={() => DetailDialog.open({})} title={t("button info")}><Icons.Tree.Edit/></MenuItem>
    }
  </>;

  const ReplaceAlongHierarchy = useDialog(ReplaceAlongInheritanceDialog);

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
        include();
      }}>
      {t("Add import")}
    </MenuItem>
  </>, [t, include]);

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const menu = props.menu ? [...props.menu, thisMenu] : [thisMenu];
  const hiddenMenu = props.hiddenMenu ? [...props.hiddenMenu, thisHiddenMenu] : [thisHiddenMenu];

  return <>
    <DataPsmBaseRow
      {...props}
      startRow={startRow}
      subtree={<DataPsmClassSubtree iri={props.iri} isOpen={collapseSubtree.isOpen} />}
      collapseToggle={collapseSubtree}
      menu={menu}
      hiddenMenu={hiddenMenu}
    />

    <DetailDialog.Component iri={props.iri} />
    <AddSurroundings.Component dataPsmClassIri={props.iri} />
    <ReplaceAlongHierarchy.Component />
  </>;
});
