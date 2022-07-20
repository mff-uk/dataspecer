import {useItemStyles} from "../../PsmItemCommon";
import {DataPsmClassItem} from "../class";
import React, {memo} from "react";
import {InheritanceOrTree} from "../../common/use-inheritance-or";
import {RowSlots} from "../../base-row";

export const DataPsmSpecializationItem: React.FC<{iri: string, inheritanceOrTree: InheritanceOrTree } & RowSlots> = memo((props) => {
  const styles = useItemStyles();

  const thisStartRow = <>
    <span className={styles.or}>specialization</span>
    {" "}
  </>;

  const startRow = props.startRow ? [thisStartRow, ...props.startRow] : [thisStartRow];

  return <DataPsmClassItem
    {...props}
    startRow={startRow}
  />;
});
