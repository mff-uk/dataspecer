import {Fab, Paper, Typography} from "@material-ui/core";
import React, {useCallback, useContext} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {DragDropContext, DropResult} from "react-beautiful-dnd";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {DataPsmRootClassItem} from "./DataPsmRootClassItem";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {DataPsmSchema} from "model-driven-data/data-psm/model";
import Skeleton from '@material-ui/lab/Skeleton';
import {LabelDescriptionEditor} from "../helper/LabelDescriptionEditor";
import {useDialog} from "../../hooks/useDialog";
import {useTranslation} from "react-i18next";
import {useResource} from "../../hooks/useResource";
import {StoreContext} from "../App";
import {SetOrder} from "../../operations/set-order";
import {SetDataPsmLabelAndDescription} from "../../operations/set-data-psm-label-and-description";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      ul: {
        paddingLeft: 0
      }
    }),
);

export const DataPsmSchemaItem: React.FC<{dataPsmSchemaIri: string}> = ({dataPsmSchemaIri}) => {
  const {resource: dataPsmSchema} = useResource<DataPsmSchema>(dataPsmSchemaIri);
  const {store} = useContext(StoreContext);

  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});

  const openUpdateLabelsDialog = useCallback(() => {
    updateLabels.open({
      data: {
        label: dataPsmSchema?.dataPsmHumanLabel ?? {},
        description: dataPsmSchema?.dataPsmHumanDescription ?? {},
      },
      update: data => {
        store.executeOperation(new SetDataPsmLabelAndDescription(dataPsmSchemaIri, data.label, data.description)).then();
      },
    });
  }, [dataPsmSchema]);

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
        <Fab
            variant="extended"
            size="small"
            color="primary"
            aria-label="edit"
            style={{float: "right"}}
            onClick={openUpdateLabelsDialog}
        >
            <EditIcon />{" "}
            {t("button edit labels")}
        </Fab>
        <updateLabels.component />
        <LanguageStringFallback from={dataPsmSchema.dataPsmHumanLabel}>{text => <Typography variant="h5">{text}</Typography>}</LanguageStringFallback>
        <LanguageStringFallback from={dataPsmSchema.dataPsmHumanDescription}>{text => <Typography color="textSecondary">{text}</Typography>}</LanguageStringFallback>
        <DragDropContext onDragEnd={itemsDragged}>
            <ul className={styles.ul}>
              {dataPsmSchema.dataPsmRoots.map(root => <DataPsmRootClassItem dataPsmClassIri={root} key={root} />)}
            </ul>
        </DragDropContext>
    </>}
    {!dataPsmSchema && <>
        <Typography variant="h5"><Skeleton /></Typography>
        <Typography color="textSecondary"><Skeleton /></Typography>
    </>}
  </Paper>
};
