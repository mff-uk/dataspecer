import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useMemo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

/**
 * Renders item that is unknown.
 * @param props
 */
export const DataPsmUnknownItem: React.FC<{iri: string | null} & RowSlots> = (props) => {
  const {resource, isLoading} = useResource(props.iri);

  const unknownText = <strong style={{color: "darkorange"}}>{props.iri === null ? "no entity" : (isLoading ? "loading" : (resource ? "unknown type of entity" : "entity not found"))}</strong>;
  const startRow = useMemo(() => props.startRow ? [...props.startRow, unknownText] : [unknownText], [props.startRow]);
  return <DataPsmBaseRow {...props} startRow={startRow} />;
}
