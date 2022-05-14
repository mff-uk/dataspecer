import React, {memo, useCallback} from "react";
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmInclude} from "@dataspecer/core/data-psm/model";
import {ItemRow} from "./item-row";
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import {IconButton, MenuItem} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {useTranslation} from "react-i18next";
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {Icons} from "../../icons";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DeleteInclude} from "../../operations/delete-include";
import {useToggle} from "../../hooks/use-toggle";

export const DataPsmIncludeItem: React.FC<DataPsmClassPartItemProperties> = memo((
    {dataPsmResourceIri: dataPsmIncludeIri, parentDataPsmClassIri, dragHandleProps}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const store = useFederatedObservableStore();


    const {resource: include} = useResource<DataPsmInclude>(dataPsmIncludeIri);
    const dataPsmClassIri = include?.dataPsmIncludes ?? null;

    const collapseIsOpen = useToggle(false);

    const del = useCallback(() => dataPsmIncludeIri &&
            store.executeComplexOperation(new DeleteInclude(dataPsmIncludeIri, parentDataPsmClassIri)),
        [dataPsmIncludeIri, parentDataPsmClassIri, store]);

    return <li className={styles.li}>
        <ItemRow actions={<>
            <MenuItem onClick={del} title={t("button delete")}><Icons.Tree.Delete/></MenuItem>
        </>}>
            <ContentCopyTwoToneIcon style={{verticalAlign: "middle"}} />
            {collapseIsOpen.isOpen ?
                <IconButton size={"small"} onClick={collapseIsOpen.close}><ExpandMoreIcon/></IconButton> :
                <IconButton size={"small"} onClick={collapseIsOpen.open}><ExpandLessIcon/></IconButton>
            }
            <span {...dragHandleProps}>
                <strong className={styles.include}>{t("includes content of")}{" "}</strong>
                {dataPsmClassIri &&
                    <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                        {(label, description) =>
                            <span title={description}>{label}</span>
                        }
                    </DataPsmGetLabelAndDescription>
                }
            </span>
        </ItemRow>
        {dataPsmClassIri && <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={collapseIsOpen.isOpen}/>}
    </li>;
});
