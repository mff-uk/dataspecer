import React, {useCallback, useContext, useRef} from "react";
import {Button, ButtonGroup, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {DataSpecificationsContext} from "../../app";
import {SetPimLabelAndDescription} from "../../shared/set-pim-label-and-description";
import {Resource} from "@dataspecer/federated-observable-store/resource";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {SpecificationEditDialog, SpecificationEditDialogEditableProperties} from "../../components/specification-edit-dialog";
import {UpdateDataSpecification} from "@dataspecer/backend-utils/interfaces";
import {BackendConnectorContext} from "../../../application";
import AccountTreeTwoToneIcon from "@mui/icons-material/AccountTreeTwoTone";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from '@mui/icons-material/Public';
import {useDialog} from "../../../editor/dialog";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";

/**
 * Button for creating a new data specification.
 */
export const CreateSpecification: React.FC = () => {
    const Dialog = useDialog(SpecificationEditDialog, ["mode", "onSubmit"]);
    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const store = useFederatedObservableStore();
    const create = useCallback(async ({label, tags, ...rest}: Partial<SpecificationEditDialogEditableProperties>) => {
        const options: UpdateDataSpecification = {...rest};
        if (tags) {
            options.tags = tags;
        }

        const dataSpecification = await backendConnector.createDataSpecification(options);
        const pim = dataSpecification.pim as string;

        // Wait for store to be initialized
        await new Promise<void>(resolve => {
            const subscriber = (iri: string, resource: Resource) => {
                if (resource.resource) {
                    store.removeSubscriber(pim, subscriber);
                    resolve();
                }
            }
            store.addSubscriber(pim, subscriber);

            setDataSpecifications({
                ...dataSpecifications,
                [dataSpecification.iri as string]: dataSpecification
            });
            setRootDataSpecificationIris([...rootDataSpecificationIris, dataSpecification.iri as string]);
        });

        if (label) {
            const op = new SetPimLabelAndDescription(pim, label, {});
            await store.executeComplexOperation(op);
        }
        Dialog.close();
    }, [backendConnector, store, Dialog, setDataSpecifications, dataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    const buttonRef = useRef(null);
    const menuOpen = useToggle(false);


    return <>
        <ButtonGroup variant="contained" ref={buttonRef}>
            <Button variant="contained" onClick={() => Dialog.open({properties: {type: DataSpecification.TYPE_DOCUMENTATION}})}>
                <AccountTreeTwoToneIcon style={{marginRight: ".25em"}}/>
            Create new
            </Button>
            <Button size="small" onClick={menuOpen.open}>
                <ArrowDropDownIcon />
            </Button>
        </ButtonGroup>

        <Menu anchorEl={buttonRef.current} open={menuOpen.isOpen} onClose={menuOpen.close}>
            <MenuItem onClick={() => {
                menuOpen.close();
                Dialog.open({properties: {type: DataSpecification.TYPE_DOCUMENTATION}});
            }}>
                <ListItemIcon>
                    <SearchIcon fontSize="small" fontWeight="bold" />
                </ListItemIcon>
                <ListItemText><strong>Create standard specification</strong></ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
                menuOpen.close();
                Dialog.open({properties: {type: DataSpecification.TYPE_EXTERNAL}})
            }}>
                <ListItemIcon>
                    <PublicIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Create external specification</ListItemText>
            </MenuItem>
        </Menu>

        <Dialog.Component mode={"create"} onSubmit={create} />
    </>
}
