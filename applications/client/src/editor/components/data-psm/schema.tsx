import {IconButton, Paper, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {DragDropContext, DropResult} from "react-beautiful-dnd";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import Skeleton from '@mui/material/Skeleton';
import {useTranslation} from "react-i18next";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {SetOrder} from "../../operations/set-order";
import {Icons} from "../../icons";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useDialog} from "../../dialog";
import {DataPsmObjectType, RootContext} from "./data-psm-row";
import {EntityChainDetailDialog} from "../detail/entity-chain-detail-dialog";

export const DataPsmSchemaItem: React.FC<{dataPsmSchemaIri: string}> = ({dataPsmSchemaIri}) => {
  const {resource: dataPsmSchema} = useResource<DataPsmSchema>(dataPsmSchemaIri);
  const readOnly = false;
  const store = useFederatedObservableStore();

  const DetailDialog = useDialog(EntityChainDetailDialog, ["iris"]);
  const openDetail = useCallback(() => DetailDialog.open({}), [DetailDialog]);

  /**
   * When moving items anywhere inside the panel of the current dataPsm schema.
   */
  const itemsDragged = useCallback(({draggableId, destination}: DropResult) => {
    if (destination) {
      const parent = destination.droppableId.split(" ")[0];
      const property = draggableId.split(" ")[0];
      store.executeComplexOperation(new SetOrder(parent, property, destination.index)).then();
    }
  }, [store]);

  const {t} = useTranslation("psm");

  const [rootContext] = useState({contextType: "root"} as RootContext);

  return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
    {dataPsmSchema && <>
        <DetailDialog.Component iris={[dataPsmSchemaIri]} />
        <Typography variant="h5">
          <LanguageStringFallback from={dataPsmSchema.dataPsmHumanLabel} fallback={<i>{t("no label")}</i>}/>
          {readOnly ||
              <IconButton sx={{ml: .5}} onClick={openDetail}>
                <Icons.Tree.Edit/>
              </IconButton>
          }
        </Typography>
        <LanguageStringFallback from={dataPsmSchema.dataPsmHumanDescription}>{text => <Typography color="textSecondary">{text}</Typography>}</LanguageStringFallback>
        <DragDropContext onDragEnd={itemsDragged}>
            <ul style={{paddingLeft: 0}}>
              {dataPsmSchema.dataPsmRoots.map(root => <DataPsmObjectType iri={root} key={root} {...rootContext} />)}
            </ul>
        </DragDropContext>
    </>}
    {!dataPsmSchema && <>
        <Typography variant="h5"><Skeleton /></Typography>
        <Typography color="textSecondary"><Skeleton /></Typography>
    </>}
  </Paper>
};
