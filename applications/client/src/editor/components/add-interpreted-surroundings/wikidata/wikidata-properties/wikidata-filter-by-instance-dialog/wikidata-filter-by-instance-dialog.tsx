import { WdFilterByInstance, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { dialog } from "../../../../../dialog";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../../contexts/wikidata-adapter-context";
import { Button, CircularProgress, DialogActions, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../../detail/common";

export interface WikidataFilterByInstanceDialogProps {
    isOpen: boolean;
    close: () => void;

    setWdFilterByInstance: React.Dispatch<React.SetStateAction<WdFilterByInstance>>;
}

export const WikidataFilterByInstanceDialog: React.FC<WikidataFilterByInstanceDialogProps> = 
    dialog({fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: 300 } } }, ({isOpen, close, setWdFilterByInstance}) => {
        const {t} = useTranslation("interpretedSurrounding");
        const wikidataAdapter = useContext(WikidataAdapterContext);
        const [wasApplied, setWasApplied] = useState(false);
        const [instanceUri, setInstanceUri] = useState<string>("");
        const {isLoading, isError, data, refetch} = useQuery(['filterByInstance', instanceUri], async () => {
                return await wikidataAdapter.wdAdapter.connector.getFilterByInstance(instanceUri);
            },
            { refetchOnWindowFocus: false, enabled: false },
        );
        
        const queryFailed = useMemo(() => {
            return (wasApplied && !isLoading && (isError || isWdErrorResponse(data) || (data != null && data.instanceOfIds.length === 0)));
        },[wasApplied, isError, isLoading, data]);
        
        // Clear form on close.
        useEffect(() => {
          if (!isOpen) {
            setInstanceUri("")
            setWasApplied(false);
          } 
        }, [isOpen])
        
        // Assign data upon refetch finish.
        useEffect(() => {
            if (wasApplied && data != null && !queryFailed) {
                console.log(data);
                setWdFilterByInstance(data as WdFilterByInstance);
                close();
            }
        }, [close, data, queryFailed, setWdFilterByInstance, isLoading, wasApplied]);

        return (
            <>
                <DialogTitle id="customized-dialog-title" close={close}>
                    {t("add filter by instance")}
                </DialogTitle>
                <DialogContent dividers style={{textAlign: "center"}} >
                    {isLoading && <CircularProgress style={{margin: "3rem auto"}}/>}
                    {!isLoading &&
                        <TextField 
                            style={{margin: "2rem auto"}}
                            label={t("input filter by instance uri")}
                            autoFocus
                            fullWidth
                            onChange={e => {
                                e.stopPropagation();
                                setInstanceUri(e.target.value);
                            }}
                            variant={"standard"}
                            autoComplete="off"
                            disabled={isLoading}
                            value={instanceUri}
                            error={queryFailed}
                            helperText={
                                <>
                                    {queryFailed && t("input filter by instance uri help error")}
                                    {queryFailed && <br/>}
                                    {t("input filter by instance uri help")}
                                </>
                            }
                        />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t("close button")}</Button>
                    <Button
                        onClick={() => { refetch(); setWasApplied(true); }}
                        disabled={isLoading || instanceUri === ""}>
                        {t("confirm button")}
                    </Button>
                </DialogActions>
            </>
        );
    }
);