import { LanguageString } from "@dataspecer/core/core/core-resource";
import { PimSchema } from "@dataspecer/core/pim/model/pim-schema";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Resource } from "@dataspecer/federated-observable-store/resource";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import { BackendConnectorContext } from "../../application";
import { useDialog } from "../../editor/dialog";
import { DataSpecificationsContext } from "../app";
import { SetPimLabelAndDescription } from "../shared/set-pim-label-and-description";
import { SpecificationCloneDialog } from "./specification-clone-dialog";

export const SpecificationMoreMenu = (props: {
    anchorEl: HTMLElement | null,
    open: boolean,
    onClose?: () => void,

    specificationIri: string,
}) => {
    const CloneDialog = useDialog(SpecificationCloneDialog, ["onSubmit", "properties"]);
    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const store = useFederatedObservableStore();
    const specificationIri = props.specificationIri;

    const specification = dataSpecifications[specificationIri];
    const {resource: pimSchema} = useResource<PimSchema>(specification?.pim);

    const editableProperties = useMemo(() => ({
        label: pimSchema?.pimHumanLabel ?? {},
    }), [pimSchema]);

    const duplicate = useCallback(async (data: {label: LanguageString}) => {
        const dataSpecification = await backendConnector.cloneDataSpecification(specificationIri, {});
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


        const op = new SetPimLabelAndDescription(pim, data.label, {});
        await store.executeComplexOperation(op);

        CloneDialog.close();
    }, [CloneDialog, backendConnector, dataSpecifications, rootDataSpecificationIris, setDataSpecifications, setRootDataSpecificationIris, specificationIri, store]);


    return <>
        <Menu
            anchorEl={props.anchorEl}
            open={props.open}
            onClose={props.onClose}
        >
            <MenuItem onClick={() => {
                    CloneDialog.open({});
                    props.onClose?.();
                }}>
                <ListItemIcon>
                    <ContentCopyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Duplicate (create a copy)</ListItemText>
            </MenuItem>
        </Menu>

        <CloneDialog.Component onSubmit={duplicate} properties={editableProperties} />
    </>
}