import * as React from "react";
import {memo} from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {Box, Card, Grid, Typography} from "@mui/material/";
import CheckIcon from "@mui/icons-material/Check";
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {useTranslation} from "react-i18next";
import {ObjectDump} from "../../helper/object-dump";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";

/**
 * Renders a part of UI dealing with everything about a specific resource which is located in the store. Specifically
 *  - IRI of the resource
 *  - Whether the resource is loading or not
 *  - Store basic information
 */
export const ResourceInStore: React.FC<{iri: string}> = memo(({iri}) => {
    const resource = useResource(iri);
    const store = useFederatedObservableStore();
    const {t} = useTranslation("detail");

    if (!iri) {
        return null;
    }

    return (
        <div>
            <Grid container spacing={5} sx={{ pt: 3 }}>
                <Grid item xs={6}>
                    <Box sx={{mb: 3}}>
                        <Typography variant="subtitle1" component="h2">
                            {t('IRI')}
                        </Typography>

                        <TextField disabled hiddenLabel variant="standard" value={iri} fullWidth />
                    </Box>

                    <Grid container spacing={5} sx={{alignItems: "center"}}>
                        <Grid item xs={6}>
                            {resource.resource && !resource.isLoading &&
                                <Typography variant="body2">
                                    <CheckIcon color="success" fontSize="small" sx={{ verticalAlign: "bottom" }} />
                                    {" "}
                                    {t('resource.ok')}
                                </Typography>
                            }

                            {!resource.resource && !resource.isLoading &&
                                <Typography variant="body2">
                                    <WarningIcon color="error" fontSize="small" sx={{ verticalAlign: "bottom" }} />
                                    {" "}
                                    {t('resource.fail')}
                                </Typography>
                            }

                            {resource.isLoading &&
                                <Typography variant="body2">
                                    <HourglassEmptyIcon color="warning" fontSize="small" sx={{ verticalAlign: "bottom" }} />
                                    {" "}
                                    {t('resource.loading')}
                                </Typography>
                            }
                        </Grid>
                        <Grid item xs={6}>
                            <Button variant="contained" fullWidth sx={{ mt: 1 }} disabled={resource.isLoading} onClick={() => store.forceReload(iri)}>
                                {t('button reload resource')}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Box sx={{mt: 2}}>
                <Card>
                    <ObjectDump obj={resource?.resource} />
                </Card>
            </Box>
        </div>
    );
});
