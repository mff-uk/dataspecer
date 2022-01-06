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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {ObjectDump} from "../../helper/object-dump";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {MemoryStore, ReadOnlyFederatedStore, ReadOnlyMemoryStore} from "model-driven-data/core";
import {SyncMemoryStore} from "../../../store/core-stores/sync-memory-store";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

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

                <Grid item xs={6}>
                    <Typography variant="subtitle1" component="h2">
                        {t('title store where item is located')}
                    </Typography>

                    <Card>
                        <CardContent>
                            <Typography variant="body2" component={"div"}>
                                {resource.store?.metadata.tags.includes("read-only") ?
                                    <div><CloseOutlinedIcon color="error" fontSize="small" sx={{ verticalAlign: "bottom" }} />{" "}{t("store is read-only")}</div> :
                                    <div><CheckIcon color="success" fontSize="small" sx={{ verticalAlign: "bottom" }} />{" "}{t("store is editable")}</div>
                                }
                                {resource.store?.metadata.tags.includes("root") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag root")}</div>
                                }
                                {resource.store?.metadata.tags.includes("reused") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag reused")}</div>
                                }
                                {resource.store?.metadata.tags.includes("reused-recursively") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag reused-recursively")}</div>
                                }
                                {resource.store?.metadata.tags.includes("pim") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag pim")}</div>
                                }
                                {resource.store?.metadata.tags.includes("data-psm") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag data-psm")}</div>
                                }
                                {resource.store?.metadata.tags.includes("cim-as-pim") &&
                                <div><InfoOutlinedIcon color="primary" fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}{t("store metadata tag cim-as-pim")}</div>
                                }

                                {resource.store?.store instanceof MemoryStore && <div style={{marginTop: "1rem"}}><SettingsOutlinedIcon fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}MemoryStore</div>}
                                {resource.store?.store instanceof ReadOnlyMemoryStore && <div style={{marginTop: "1rem"}}><SettingsOutlinedIcon fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}ReadOnlyMemoryStore</div>}
                                {resource.store?.store instanceof SyncMemoryStore && <div style={{marginTop: "1rem"}}><SettingsOutlinedIcon fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}SyncMemoryStore</div>}
                                {resource.store?.store instanceof ReadOnlyFederatedStore && <div style={{marginTop: "1rem"}}><SettingsOutlinedIcon fontSize="small" sx={{verticalAlign: "bottom"}} />{" "}ReadOnlyFederatedStore</div>}
                            </Typography>
                        </CardContent>
                    </Card>
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
