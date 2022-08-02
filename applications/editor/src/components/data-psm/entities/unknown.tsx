import {DataPsmBaseRow, RowSlots} from "../base-row";
import {useMemo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

/**
 * Renders item that is unknown, or is being loaded.
 * @param props
 */
export const DataPsmUnknownItem: React.FC<{iri: string | null} & RowSlots> = (props) => {
  const {resource, isLoading} = useResource(props.iri);
  
  const startRow = useMemo(() => {
    const unknownText = <strong style={{color: "darkorange"}}>{props.iri === null ? "no entity" : (isLoading ? "loading" : (resource ? "unknown type of entity" : "entity not found"))}</strong>;
    return props.startRow ? [...props.startRow, unknownText] : [unknownText]
  }, [isLoading, props.iri, props.startRow, resource]);

  const iris = useMemo(() => [...props.iris ?? [], props.iri as string], [props.iris, props.iri]);

  return <DataPsmBaseRow {...props} startRow={startRow} iris={iris} />;
}
