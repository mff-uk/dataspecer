import { WdEntityDescOnly, isWdEntityPropertyDesc } from "@dataspecer/wikidata-experimental-adapter";
import { ReactElement } from "react";
import { useDialog } from "../../../dialog";
import { WikidataEntityDetailDialog } from "../../detail/wikidata-entity-detail/wikidata-entity-detail-dialog";
import { List, ListItem, ListItemText, Typography, IconButton, Stack } from "@mui/material";
import i18n from "../../../../i18n";
import { translateFrom } from "../../helper/LanguageStringComponents";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";

export interface WikidataSearchResultsListProps<T extends WdEntityDescOnly> {
    results: T[]
    onSelect: (wdEntity: T) => void;
    detailOnSelect: (wdEntity : WdEntityDescOnly) => void;
    detailOnSelectDiabledWhen: (wdEntity: WdEntityDescOnly) => boolean;
    detailOnSelectButtonText: (wdEntity: WdEntityDescOnly) => string;
}

export function WikidataSearchResultsList<T extends WdEntityDescOnly>(props: WikidataSearchResultsListProps<T>): ReactElement {
    const WdEntityDialog = useDialog(WikidataEntityDetailDialog)

    return (
        <>
            <List dense component="nav"
                sx={{
                    overflow: 'auto',
                    margin: theme => theme.spacing(2, 0, 0, 0),
                }}
                >
                {props.results.map((result: T, index: number) =>
                    <ListItem button key={result.iri} onClick={() => {
                        props.onSelect(result);
                    }}>
                        <Typography marginRight={2}>{(index + 1).toString()}.</Typography>
                        <ListItemText secondary={
                                <Typography variant="body2" color="textSecondary" noWrap>
                                    {translateFrom(result.descriptions, i18n.languages)}
                                </Typography>
                            }
                        >
                            <Stack direction="row" spacing={1}>
                                <strong>{translateFrom(result.labels, i18n.languages)}</strong>
                                <Typography fontSize={13}>
                                        ({isWdEntityPropertyDesc(result) ? "P" : "Q"}{result.id.toString()}) 
                                </Typography>
                            </Stack>
                        </ListItemText>
                        <IconButton 
                            size="small" 
                            onClick={e => {
                                e.stopPropagation();
                                WdEntityDialog.open({
                                    wdEntity: result, 
                                    onSelect: props.detailOnSelect, 
                                    onSelectButtonDisableWhen: props.detailOnSelectDiabledWhen, 
                                    onSelectButtonText: props.detailOnSelectButtonText})
                            }}
                        >
                            <InfoTwoToneIcon/>
                        </IconButton>
                    </ListItem>
                )}
            </List>
            <WdEntityDialog.Component />
        </>
    )
} 