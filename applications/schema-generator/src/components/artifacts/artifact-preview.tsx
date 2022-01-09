import React, {ReactElement, useEffect, useState} from "react";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {Alert, Container, Fab, Paper} from "@mui/material";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {StoreContext} from "../App";
import {useTranslation} from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';

export const ArtifactPreview: React.FC<{
    artifactPreview: ((store: CoreResourceReader, schema: string) => Promise<ReactElement>) | null,
    setArtifactPreview: (value: null) => void,
}> = ({artifactPreview, setArtifactPreview}) => {
    const {t} = useTranslation("artifacts");
    const {psmSchemas, store} = React.useContext(StoreContext);

    const [storeState, setStoreState] = useState<{}>({});

    useEffect(() => {
        const listener = () => setStoreState({});
        store.addEventListener("afterOperationExecuted", listener);
        return () => store.removeEventListener("afterOperationExecuted", listener);
    }, [store]);

    const component = useAsyncMemo(async () => {
        if (artifactPreview) {
            try {
                return await artifactPreview(store, psmSchemas[0]);
            } catch (error) {
                return <Alert severity="error"><strong>{t("error mdd")}</strong><br />{(error as Error).message}</Alert>;
            }
        }
        return null;
    }, [artifactPreview, store, psmSchemas, storeState]);

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
