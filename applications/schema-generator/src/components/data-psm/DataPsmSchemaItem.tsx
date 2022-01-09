import {IconButton, Paper, Typography} from "@mui/material";
import React, {useCallback, useContext} from "react";
import {DragDropContext, DropResult} from "react-beautiful-dnd";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {DataPsmClassItem} from "./DataPsmClassItem";
import {createStyles, makeStyles} from "@mui/styles";
import {DataPsmSchema} from "@model-driven-data/core/data-psm/model";
import Skeleton from '@mui/material/Skeleton';
import {LabelDescriptionEditor} from "../helper/LabelDescriptionEditor";
import {useDialog} from "../../hooks/useDialog";
import {useTranslation} from "react-i18next";
import {useResource} from "../../hooks/useResource";
import {StoreContext} from "../App";
import {SetOrder} from "../../operations/set-order";
import {SetDataPsmLabelAndDescription} from "../../operations/set-data-psm-label-and-description";
import {isReadOnly} from "../../store/federated-observable-store";
import {Icons} from "../../icons";

const useStyles = makeStyles(() =>
    createStyles({
      ul: {
        paddingLeft: 0
      }
    }),
);

export const DataPsmSchemaItem: React.FC<{dataPsmSchemaIri: string}> = ({dataPsmSchemaIri}) => {
  const {resource: dataPsmSchema, store: schemaStore} = useResource<DataPsmSchema>(dataPsmSchemaIri);
  const readOnly = isReadOnly(schemaStore);
  const {store} = useContext(StoreContext);

  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});

  const openUpdateLabelsDialog = useCallback(() => {
    updateLabels.open({
      data: {
        label: dataPsmSchema?.dataPsmHumanLabel ?? {},
        description: dataPsmSchema?.dataPsmHumanDescription ?? {},
      },
      update: data => {
        store.executeOperation(new SetDataPsmLabelAndDescription(dataPsmSchema?.iri as string, data.label, data.description)).then();
      },
    });
  }, [dataPsmSchema, store, updateLabels]);

  const styles = useStyles();

  /**
   * When moving items anywhere inside the panel of the current dataPsm schema.
   */
  const itemsDragged = useCallback(({draggableId, destination}: DropResult) => {
    if (destination) {
      store.executeOperation(new SetOrder(destination.droppableId, draggableId, destination.index)).then();
    }
  }, [store]);

  const {t} = useTranslation("psm");

  return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
    {dataPsmSchema && <>
        <updateLabels.Component />
        <Typography variant="h5">
          <LanguageStringFallback from={dataPsmSchema.dataPsmHumanLabel} fallback={<i>{t("no label")}</i>}/>
          {readOnly ||
              <IconButton sx={{ml: .5}} onClick={openUpdateLabelsDialog}>
                <Icons.Tree.Edit/>
              </IconButton>
          }
        </Typography>
        <LanguageStringFallback from={dataPsmSchema.dataPsmHumanDescription}>{text => <Typography color="textSecondary">{text}</Typography>}</LanguageStringFallback>
        <DragDropContext onDragEnd={itemsDragged}>
            <ul className={styles.ul}>
              {dataPsmSchema.dataPsmRoots.map(root => <DataPsmClassItem dataPsmClassIri={root} key={root} />)}
            </ul>
        </DragDropContext>
    </>}
    {!dataPsmSchema && <>
        <Typography variant="h5"><Skeleton /></Typography>
        <Typography color="textSecondary"><Skeleton /></Typography>
    </>}
  </Paper>
};
