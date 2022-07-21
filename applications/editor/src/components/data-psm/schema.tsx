import {IconButton, Paper, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {DragDropContext, DropResult} from "react-beautiful-dnd";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {createStyles, makeStyles} from "@mui/styles";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import Skeleton from '@mui/material/Skeleton';
import {useTranslation} from "react-i18next";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {SetOrder} from "../../operations/set-order";
import {Icons} from "../../icons";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useDialog} from "../../dialog";
import {DataPsmSchemaDetailDialog} from "../detail/data-psm-schema-detail-dialog";
import {DataPsmObjectType, RootContext} from "./data-psm-row";


const useStyles = makeStyles(() =>
    createStyles({
      ul: {
        paddingLeft: 0
      }
    }),
);

export const DataPsmSchemaItem: React.FC<{dataPsmSchemaIri: string}> = ({dataPsmSchemaIri}) => {
  const {resource: dataPsmSchema} = useResource<DataPsmSchema>(dataPsmSchemaIri);
  const readOnly = false;
  const store = useFederatedObservableStore();

  const DetailDialog = useDialog(DataPsmSchemaDetailDialog, ["iri"]);
  const openDetail = useCallback(() => DetailDialog.open({}), [DetailDialog]);

  const styles = useStyles();

  /**
   * When moving items anywhere inside the panel of the current dataPsm schema.
   */
  const itemsDragged = useCallback(({draggableId, destination}: DropResult) => {
    if (destination) {
      store.executeComplexOperation(new SetOrder(destination.droppableId, draggableId, destination.index)).then();
    }
  }, [store]);

  const {t} = useTranslation("psm");

  const [rootContext] = useState({contextType: "root"} as RootContext);

  // const xx = useResourcesInMemo(async getResource => {
  //   console.log("spoustim funkci");
  //   if (dataPsmSchema?.iri) {
  //     const schema = await getResource(dataPsmSchema?.iri) as DataPsmSchema;
  //     const or = await getResource(schema.dataPsmRoots[0]) as DataPsmOr;
  //     const cls = await getResource(or.dataPsmChoices[0]) as DataPsmClass;
  //     return cls.dataPsmTechnicalLabel;
  //   }
  // }, [dataPsmSchema?.iri]);
  //
  // useEffect(() => console.info("new value", xx[0], xx[1]), xx);

  // const [labels, isLoading] = useResourcesInMemo(async (getResource) => {
  //   console.log("exec");
  //   const resource = await getResource("https://ofn.gov.cz/class/1658023614340-ccda-7f88-bc0b") as DataPsmClass;
  //   const labels = [] as string[];
  //   for (const part of resource.dataPsmParts) {
  //     const partResource = await getResource(part) as DataPsmAttribute;
  //     labels.push(partResource?.dataPsmTechnicalLabel ?? "");
  //   }
  //   return labels;
  // }, []);
  //
  // useEffect(() => console.info("new value", labels), [labels]);

  return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
    {dataPsmSchema && <>
        <DetailDialog.Component iri={dataPsmSchemaIri} />
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
            <ul className={styles.ul}>
              {dataPsmSchema.dataPsmRoots.map(root => <DataPsmObjectType iri={root} key={root} context={rootContext} />)}
            </ul>
        </DragDropContext>
    </>}
    {!dataPsmSchema && <>
        <Typography variant="h5"><Skeleton /></Typography>
        <Typography color="textSecondary"><Skeleton /></Typography>
    </>}
  </Paper>
};
