import React, {ReactElement, useContext, useEffect, useState} from "react";
import {Alert, Container, Fab, Paper} from "@mui/material";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {ConfigurationContext} from "../App";
import {useTranslation} from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";
import {Configuration} from "../../configuration/configuration";

/**
 * Previews a generated artifact content in a dialog.
 * @param artifactPreview
 * @param setArtifactPreview
 * @constructor
 */
export const ArtifactPreview: React.FC<{
    artifactPreview: ((configuration: Configuration) => Promise<ReactElement>) | null,
    setArtifactPreview: (value: null) => void,
}> = ({artifactPreview, setArtifactPreview}) => {
    const {t} = useTranslation("artifacts");
    const configuration = useContext(ConfigurationContext);
    const store = useFederatedObservableStore();

    const [changeTrigger, setChangeTrigger] = useState<{}>({});

    useEffect(() => {
        const listener = () => setChangeTrigger({});
        store.addEventListener("afterOperationExecuted", listener);
        return () => store.removeEventListener("afterOperationExecuted", listener);
    }, [store]);

    const component = useAsyncMemo(async () => {
        if (artifactPreview) {
            try {
                return await artifactPreview(configuration);
            } catch (error) {
                return <Alert severity="error"><strong>{t("error mdd")}</strong><br />{(error as Error).message}</Alert>;
            }
        }
        return null;
    }, [artifactPreview, configuration, changeTrigger]); // Keep changeTrigger as a dependency

    if (!artifactPreview) {
        return null;
    }

    return <Container>
        <Paper style={{padding: "1rem", margin: "1rem 0"}}>
            <Fab
                variant="extended"
                size="small"
                color="primary"
                aria-label="edit"
                style={{float: "right", marginLeft: "2rem"}}
                onClick={() => setArtifactPreview(null)}
            >
                <CloseIcon />{" "}
                {t("close")}
            </Fab>
            {component ?? null}
        </Paper>
    </Container>
}
