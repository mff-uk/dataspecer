import { LanguageString } from "@dataspecer/core/core/core-resource";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import { BackendConnectorContext } from "../../application";
import { useDialog } from "../../editor/dialog";
import { DataSpecificationsContext } from "../app";
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
    const specificationIri = props.specificationIri;

    const specification = dataSpecifications[specificationIri];

    const editableProperties = useMemo(() => ({
        label: specification.label ?? {},
    }), [specification.label]);

    const duplicate = useCallback(async (data: {label: LanguageString}) => {
        const dataSpecification = await backendConnector.cloneDataSpecification(specificationIri, {label: data.label});

        setDataSpecifications({
            ...dataSpecifications,
            [dataSpecification.iri as string]: dataSpecification
        });
        setRootDataSpecificationIris([...rootDataSpecificationIris, dataSpecification.iri as string]);

        CloneDialog.close();
    }, [CloneDialog, backendConnector, dataSpecifications, rootDataSpecificationIris, setDataSpecifications, setRootDataSpecificationIris, specificationIri]);


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