import React, {memo} from "react";
import {ObjectContext} from "../data-psm-row";
import {InheritanceOrTree} from "../common/use-inheritance-or";
import {RowSlots} from "../base-row";
import {useItemStyles} from "../styles";
import {DataPsmClassItem} from "./class";

/**
 * Represents OR that meets conditions to be an inheritance OR.
 */
export const InheritanceOr: React.FC<{ iri: string, inheritanceOrTree: InheritanceOrTree } & ObjectContext & RowSlots> = memo((props) => {
  const styles = useItemStyles();

  const thisEndRow = <>
    <span className={styles.or}>{" "}with specializations</span>
  </>;

  const endRow = props.endRow ? [thisEndRow, ...props.endRow] : [thisEndRow];

  return <DataPsmClassItem
    {...props}
    iri={props.inheritanceOrTree.dataPsmObjectIri}
    endRow={endRow}
  />;
});
