import { Button, DialogActions, DialogContentText, Divider, Grid, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { DialogContent, DialogTitle } from "../common";
import { WdClassHierarchyDescOnly, WdEntityDescOnly, WdPropertyDescOnly, isWdEntityPropertyDesc } from "@dataspecer/wikidata-experimental-adapter";
import { dialog } from "../../../dialog";
import { useTranslation } from "react-i18next";
import { selectLanguage } from "../../../utils/select-language";
import { CimLinks } from "../components/cim-links";
import { LanguageStringFallback } from "../../helper/LanguageStringComponents";
import { InDifferentLanguages } from "../components/InDifferentLanguages";
import { DETAIL_SCROLLABLE_TARGET_ID } from "./wikidata-entity-tab/wikidata-entity-detail-grid";
import { WikidataPropertyDetailTab } from "./wikidata-entity-tab/wikidata-property-detail-tab";
import { WikidataClassDetailTab } from "./wikidata-entity-tab/wikidata-class-detail-tab";

export interface WikidataShowSelectedDialogProps {
    isOpen: boolean;
    close: () => void;

    wdEntity: WdEntityDescOnly | undefined;
    onSelect?: undefined | ((entity: WdEntityDescOnly) => void);
    onSelectButtonText?: undefined | ((entity: WdEntityDescOnly) => string);
    onSelectButtonDisableWhen?: undefined | ((entity: WdEntityDescOnly) => boolean);
}

export const WikidataEntityDetailDialog: React.FC<WikidataShowSelectedDialogProps> =
    dialog({ fullWidth: true, maxWidth: "xl", PaperProps: { sx: { height: "90%" } } }, (props) => {
        if (props.isOpen && props.wdEntity) {
            return <WikidataEntityDetailDialogClickThroughContent {...props} />
        }
        return null;
    });

const WikidataEntityDetailDialogClickThroughContent: React.FC<WikidataShowSelectedDialogProps> = ({close, wdEntity, onSelect, onSelectButtonDisableWhen, onSelectButtonText}) => {
    const { t: tUI, i18n } = useTranslation("ui");
    const { t: tDetail } = useTranslation("detail");
    const [entitiesHistory, setEntitiesHistory] = useState<WdEntityDescOnly[]>([]);
    const [tab, setTab] = useState(0);

    let wdEntityForDetail = wdEntity;
    if (entitiesHistory.length !== 0) {
        wdEntityForDetail = entitiesHistory[entitiesHistory.length - 1];
    }

    function onNewEntityHandle(newWdEntity: WdEntityDescOnly) {
        setEntitiesHistory([...entitiesHistory, newWdEntity]);
    }

    function onBackEntityHandle() {
        setEntitiesHistory(entitiesHistory.slice(0, -1)); 
    }

    const isEntityProperty = isWdEntityPropertyDesc(wdEntityForDetail);

    return (
        <>
            <DialogTitle id='customized-dialog-title' close={close}>
                <div>
                    {tDetail(isEntityProperty ? "wikidata.property" : "wikidata.class")}: {" "} 
                    <strong>
                        {selectLanguage(wdEntityForDetail.labels, i18n.languages)}{" "} 
                    </strong>
                    ({isEntityProperty ? "P" : "Q"}{wdEntityForDetail.id.toString()})
                    <CimLinks iri={wdEntityForDetail.iri} />
                </div>
                <DialogContentText>
                    <LanguageStringFallback from={wdEntityForDetail.descriptions} fallback={<i>{tUI("no description")}</i>}/>
                </DialogContentText>
            </DialogTitle>
            <DialogContent dividers id={DETAIL_SCROLLABLE_TARGET_ID} key={wdEntity.iri}>
                <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
                    <Tab label={tDetail('tab basic info')} />
                    <Tab label={"Wikidata"} />
                </Tabs>
                {tab === 0 &&
                    <Grid container spacing={5} sx={{pt: 3}}>
                        <Grid item xs={6}>
                            <InDifferentLanguages
                                label={wdEntityForDetail.labels}
                                description={wdEntityForDetail.descriptions}
                            />
                        </Grid>
                        <Grid item xs={6}>

                        </Grid>
                    </Grid>
                }
                {tab === 1 && 
                    <>
                        {
                            isEntityProperty ? 
                            <WikidataPropertyDetailTab wdProperty={wdEntityForDetail as WdPropertyDescOnly} onNewDetailEntity={onNewEntityHandle} /> :
                            <WikidataClassDetailTab wdClass={wdEntityForDetail as WdClassHierarchyDescOnly} onNewDetailEntity={onNewEntityHandle} />
                        }   
                    </>
                }
            </DialogContent>
            <DialogActions>
                <Button color="info" disabled={entitiesHistory.length === 0} onClick={onBackEntityHandle} variant="contained" size="medium">
                    {tUI("return back button unnamed tool")} ({entitiesHistory.length})
                </Button>
                <Divider orientation="vertical"/>

                {onSelect !== undefined &&
                    <Button 
                        disabled={onSelectButtonDisableWhen(wdEntityForDetail)}
                        onClick={() => {
                            onSelect(wdEntityForDetail);
                            close();
                        }}
                    >
                        {onSelectButtonText(wdEntityForDetail)}
                    </Button>
                }
                <Button color="error" onClick={close}>{tUI("close")}</Button>
            </DialogActions>
        </>
    );
}

