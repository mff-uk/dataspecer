import React, {memo, useCallback, useContext, useMemo} from "react";
import {ObjectContext} from "../data-psm-row";
import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useTranslation} from "react-i18next";
import {Span, sxStyles} from "../styles";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useToggle} from "../../../hooks/use-toggle";
import {UnwrapOr} from "../../../operations/unwrap-or";
import {useDialog} from "../../../dialog";
import {AddToOrDialog} from "../add-to-or/add-to-or-dialog";
import {SearchDialog} from "../../cim-search/search-dialog";
import {CoreResourceReader, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CreateNewClassInOr} from "../../../operations/create-new-class-in-or";
import {PimClass} from "@dataspecer/core/pim/model";
import {MenuItem} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import {DataPsmOrSubtree} from "../subtrees/or-subtree";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmOr} from "@dataspecer/core/data-psm/model";
import {ConfigurationContext} from "../../App";

/**
 * Represents a regular PSM OR entity (not the inheritance OR visualization)
 */
export const RegularOr: React.FC<{ iri: string} & ObjectContext & RowSlots> = memo((props) => {
  const {t} = useTranslation("psm");
  const store = useFederatedObservableStore();
  const {dataSpecifications, dataSpecificationIri} = useContext(ConfigurationContext);
  const dataSpecification = dataSpecifications[dataSpecificationIri as string];
  const {operationContext} = useContext(ConfigurationContext);

  const {resource} = useResource<DataPsmOr>(props.iri);

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
      const op = new CreateNewClassInOr(props.iri, pimClassIri, pimStore);
      op.setContext(operationContext);
      await store.executeComplexOperation(op);
      AddToOr.close();
    }
  }, [AddToOr, props.iri, store, operationContext]);

  const onSearchClass = useCallback(async (pimClass: PimClass) => {
    if (pimClass) {
      const pimStore = ReadOnlyMemoryStore.create({
        [pimClass.iri as string]: pimClass
      });
      const op = new CreateNewClassInOr(props.iri, pimClass.iri as string, pimStore, dataSpecification.pim);
      op.setContext(operationContext);
      await store.executeComplexOperation(op);
      SearchToOr.close();
    }
  }, [SearchToOr, props.iri, store, dataSpecification.pim, operationContext]);

  const thisStartRow = <>
    <Span sx={sxStyles.or}>{t("OR")}</Span>
  </>;

  const thisMenu = <>
    {props.contextType === "association" && <MenuItem onClick={() => AddToOr.open({})} title={t("button add")}><AddIcon/></MenuItem>}
    {props.contextType === "root" && <MenuItem onClick={() => SearchToOr.open({})} title={t("button add")}><AddIcon/></MenuItem>}
  </>;

  const thisHiddenMenu = (close: () => void) => <>
    {resource && resource.dataPsmChoices.length === 1 &&
      <MenuItem
        onClick={() => {
          close();
          unwrap();
        }}>
        {t("Unwrap")}
      </MenuItem>
    }
  </>;

  const startRow = props.startRow ? [...props.startRow, thisStartRow] : [thisStartRow];
  const menu = props.menu ? [...props.menu, thisMenu] : [thisMenu];
  const hiddenMenu = props.hiddenMenu ? [...props.hiddenMenu, thisHiddenMenu] : [thisHiddenMenu];

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <>
    <DataPsmBaseRow
      {...props}
      icon={props.icon ?? <CallSplitIcon style={{verticalAlign: "middle"}}/>}
      startRow={startRow}
      subtree={<DataPsmOrSubtree iri={props.iri} isOpen={collapseSubtree.isOpen}/>}
      collapseToggle={collapseSubtree}
      menu={menu}
      hiddenMenu={hiddenMenu}
      iris={iris}
    />

    {props.contextType === "association" && <AddToOr.Component typePimClassIri={props.parentTypePimIri} onSelected={onAddClass}/>}
    {props.contextType === "root" && <SearchToOr.Component selected={onSearchClass}/>}
  </>;
});
