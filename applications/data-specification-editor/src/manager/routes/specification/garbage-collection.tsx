import React, {memo, useContext} from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import {BackendConnectorContext} from "../../../application";
import {useSnackbar} from "notistack";

export const GarbageCollection = memo(({dataSpecificationIri} : {dataSpecificationIri: string}) => {
    const backendConnector = useContext(BackendConnectorContext);
    const {enqueueSnackbar} = useSnackbar();

    const [loading, setLoading] = React.useState(false);
    const run = () => {
        setLoading(true);
        backendConnector.doGarbageCollection(dataSpecificationIri)
            .then(result => {
                // @ts-ignore
                const count = result.deletedEntities ?? 0;
                if (count > 0) {
                    enqueueSnackbar(`${count} entities successfully removed.`, {variant: "success"});
                } else {
                    enqueueSnackbar("Operation succeeded. No entities were removed.", {variant: "info"});
                }
            })
            .catch(error => {
                enqueueSnackbar("Error occurred. No changes were made.", {variant: "error"});
            }).finally(() => {
                setLoading(false);
            });
    }

    return <LoadingButton
        disabled={loading}
        loading={loading}
        onClick={run}>Perform garbage collection</LoadingButton>

});
