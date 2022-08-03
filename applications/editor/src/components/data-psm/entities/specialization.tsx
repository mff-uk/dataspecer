import {useItemStyles} from "../styles";
import {DataPsmClassItem} from "./class";
import React, {memo, useCallback} from "react";
import {InheritanceOrTree} from "../common/use-inheritance-or";
import {RowSlots} from "../base-row";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DeleteInheritanceOrSpecialization} from "../../../operations/delete-inheritance-or-specialization";
import {DataPsmDeleteButton} from "../class/DataPsmDeleteButton";
import {ObjectContext} from "../data-psm-row";

/**
 * Represents an object type PSM entity in OR under the inheritance view.
 */
export const DataPsmSpecializationItem: React.FC<{iri: string, inheritanceOrTree: InheritanceOrTree } & RowSlots & ObjectContext> = memo((props) => {
  const styles = useItemStyles();
  const store = useFederatedObservableStore();

  const thisStartRow = <>
    <span className={styles.or}>specialization</span>
    {" "}
  </>;

  const startRow = props.startRow ? [thisStartRow, ...props.startRow] : [thisStartRow];

  const deleteSpecialization = useCallback(() => {
    store.executeComplexOperation(new DeleteInheritanceOrSpecialization(props.inheritanceOrTree.dataPsmObjectIri, props.iri))
  }, [store, props.inheritanceOrTree.dataPsmObjectIri, props.iri]);

  const thisMenu = <>
    <DataPsmDeleteButton onClick={deleteSpecialization} />
  </>;

  const menu = props.menu ? [thisMenu, ...props.menu] : [thisMenu];

  return <DataPsmClassItem
    {...props}
    startRow={startRow}
    menu={menu}
  />;
});
