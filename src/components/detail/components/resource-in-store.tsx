import * as React from "react";
import {memo, useContext} from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {Box, Card, CardContent, Grid, Typography} from "@mui/material/";
import CheckIcon from "@mui/icons-material/Check";
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {useResource} from "../../../hooks/useResource";
import {StoreContext} from "../../App";
import {useTranslation} from "react-i18next";
import {ObjectDump} from "../../helper/object-dump";

/**
 * Renders a part of UI dealing with everything about a specific resource which is located in the store. Specifically
 *  - IRI of the resource
 *  - Whether the resource is loading or not
 *  - Store basic information
 */
export const ResourceInStore: React.FC<{iri: string}> = memo(({iri}) => {
    const resource = useResource(iri);
    const {store} = useContext(StoreContext);
    const {t} = useTranslation("detail");

    if (!iri) {
        return null;
    }

    return (
        <div>
            <TextField disabled label="IRI" variant="filled" value={iri} fullWidth />

            <Grid container spacing={5} sx={{ pt: 3 }}>
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

                    <Button variant="contained" fullWidth sx={{ mt: 1 }} disabled={resource.isLoading} onClick={() => store.forceReload(iri)}>
                        {t('button reload resource')}
                    </Button>
                </Grid>

                <Grid item xs={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2">
                                <CheckIcon color="success" fontSize="small" sx={{ verticalAlign: "bottom" }} />{" "}
                                Store lze upravovat. (není readonly)
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Lokální memory store obsahující PIM a data PSM.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{mt: 2}}>
                <ObjectDump obj={resource?.resource} />
            </Box>
        </div>
    );
});
