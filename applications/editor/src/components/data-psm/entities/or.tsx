import React, {memo, useCallback} from "react";
import {useItemStyles} from "../PsmItemCommon";
import {DataPsmOr} from "@dataspecer/core/data-psm/model";
import {useToggle} from "../../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmOrSubtree} from "../subtrees/or-subtree";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import {UnwrapOr} from "../../../operations/unwrap-or";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {MenuItem} from "@mui/material";
import {useDialog} from "../../../dialog";
import {AddToOrDialog} from "../add-to-or/add-to-or-dialog";
import AddIcon from "@mui/icons-material/Add";
import {SearchDialog} from "../../cim-search/search-dialog";
import {CoreResourceReader} from "@dataspecer/core/core";
import {CreateNewClassInOr} from "../../../operations/create-new-class-in-or";
import {PimClass} from "@dataspecer/core/pim/model";
import {ObjectContext} from "../data-psm-row";

export const DataPsmOrItem: React.FC<{iri: string, context: ObjectContext} & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  const styles = useItemStyles();
  const store = useFederatedObservableStore();

  const collapseSubtree = useToggle(true);

  // Unwrapping the OR: All references to this OR will be replaced with the single class that is in the OR.
  const unwrap = useCallback(() =>
      store.executeComplexOperation(new UnwrapOr(props.iri))
    , [store, props.iri]);

  const AddToOr = useDialog(AddToOrDialog, ["typePimClassIri", "onSelected"]);
  const SearchToOr = useDialog(SearchDialog, ["selected"]);

  // When user selects class to add to OR that is in context of Association
  const onAddClass = useCallback(async (pimClassIri: string, pimStore: CoreResourceReader) => {
    if (props.iri) {
      await store.executeComplexOperation(new CreateNewClassInOr(props.iri, pimClassIri, pimStore));
      AddToOr.close();
    }
  }, [AddToOr, props.iri, store]);

  const onSearchClass = useCallback((pimClassIri: PimClass) => {},[]);

  const thisStartRow = <>
    <span className={styles.or}>OR</span>
  </>;

  const thisMenu = <>
    {props.context.contextType === "association" && <MenuItem onClick={() => AddToOr.open({})} title={t("button add")}><AddIcon/></MenuItem>}
    {props.context.contextType === "root" && <MenuItem onClick={() => SearchToOr.open({})} title={t("button add")}><AddIcon/></MenuItem>}
  </>;

  const thisHiddenMenu = (close: () => void) => <>
    <MenuItem
      onClick={() => {
        close();
        unwrap();
      }}>
      {t("Unwrap")}
    </MenuItem>
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const menu = props.menu ? [...props.menu, thisMenu] : [thisMenu];
  const hiddenMenu = props.hiddenMenu ? [...props.hiddenMenu, thisHiddenMenu] : [thisHiddenMenu];

  return <>
    <DataPsmBaseRow
      {...props}
      icon={props.icon ?? <CallSplitIcon style={{verticalAlign: "middle"}} />}
      startRow={startRow}
      subtree={<DataPsmOrSubtree iri={props.iri} isOpen={collapseSubtree.isOpen} />}
      collapseToggle={collapseSubtree}
      menu={menu}
      hiddenMenu={hiddenMenu}
    />

    {props.context.contextType === "association" && <AddToOr.Component typePimClassIri={props.context.parentTypePimIri} onSelected={onAddClass}/>}
    {props.context.contextType === "root" && <SearchToOr.Component selected={onSearchClass}/>}
  </>;
});
