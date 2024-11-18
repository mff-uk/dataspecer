import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from "@mui/icons-material/Search";
import { Button, ButtonGroup, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React, { memo, useCallback, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../../application";
import { useDialog } from "../../../editor/dialog";
import { DataSpecificationsContext } from "../../app";
import { SpecificationEditDialog, SpecificationEditDialogEditableProperties } from "../../components/specification-edit-dialog";
import { useToggle } from "../../use-toggle";
import { FilterContext } from "./filter-by-tag-select";

/**
 * Button for creating a new data specification.
 */
export const CreateSpecificationButton = memo(({onSpecificationCreated}: {onSpecificationCreated?: (specification: string) => void}) => {
    const [filter] = React.useContext(FilterContext);
    const {t} = useTranslation("ui", { keyPrefix: 'create specification dialog' });

    const Dialog = useDialog(SpecificationEditDialog, ["mode", "onSubmit", "properties"]);
    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const store = useFederatedObservableStore();
    const create = useCallback(async ({label, tags, ...rest}: Partial<SpecificationEditDialogEditableProperties>) => {
        const options = {...rest, label, tags};
        const dataSpecification = await backendConnector.createDataSpecification(options);
        setDataSpecifications({
            ...dataSpecifications,
            [dataSpecification.iri]: dataSpecification,
        });
        Dialog.close();
        onSpecificationCreated?.(dataSpecification.iri as string);
    }, [backendConnector, Dialog, onSpecificationCreated, store, setDataSpecifications, dataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    const buttonRef = useRef(null);
    const menuOpen = useToggle(false);

    return <>
        <ButtonGroup variant="contained" ref={buttonRef}>
            <Button variant="contained" onClick={() => Dialog.open({properties: {type: DataSpecification.TYPE_DOCUMENTATION, tags: filter ? [filter] : []}})}>
                <AddIcon style={{marginRight: ".25em"}}/>
                {t("button open create")}
            </Button>
            <Button size="small" onClick={menuOpen.open}>
                <ArrowDropDownIcon />
            </Button>
        </ButtonGroup>

        <Menu anchorEl={buttonRef.current} open={menuOpen.isOpen} onClose={menuOpen.close} PaperProps={{style: {width: "10cm"}}}>
            <MenuItem onClick={() => {
                menuOpen.close();
                Dialog.open({properties: {type: DataSpecification.TYPE_DOCUMENTATION, tags: filter ? [filter] : []}});
            }}>
                <ListItemIcon>
                    <SearchIcon fontSize="small" fontWeight="bold" />
                </ListItemIcon>
                <ListItemText secondary={<div style={{whiteSpace: "break-spaces"}}>{t("standard specification.button create description")}</div>} sx={{fontWeight: "bold"}}>
                    {t("standard specification.button create")}
                </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
                menuOpen.close();
                Dialog.open({properties: {type: DataSpecification.TYPE_EXTERNAL, tags: filter ? [filter] : []}})
            }}>
                <ListItemIcon>
                    <PublicIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText secondary={<div style={{whiteSpace: "break-spaces"}}>{t("external specification.button create description")}</div>}>
                    {t("external specification.button create")}
                </ListItemText>
            </MenuItem>
        </Menu>

        <Dialog.Component mode={"create"} onSubmit={create} />
    </>
});
