import {
    WdClassHierarchyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import {
    ListItem,
    Typography,
    IconButton,
    ListItemText,
    Box,
    ListItemIcon,
    Radio,
} from "@mui/material";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
    LanguageStringText,
    LanguageStringUndefineable,
} from "../../../../../helper/LanguageStringComponents";
import React from "react";
import { UseDialogOpenFunction } from "../../../../../../dialog";
import { WikidataEntityDetailDialog } from "../../../wikidata-entity-detail-dialog/wikidata-entity-detail-dialog";

export interface WikidataClassItemProps {
    wdClass: WdClassHierarchyDescOnly;
    selectedWdClass: WdClassHierarchyDescOnly | undefined;
    setSelectedWdClass: (wdClass: WdClassHierarchyDescOnly | undefined) => void;
    openDetailDialogFunc: UseDialogOpenFunction<typeof WikidataEntityDetailDialog>;
}

export const WikidataClassItem: React.FC<WikidataClassItemProps> = ({
    wdClass,
    selectedWdClass,
    setSelectedWdClass,
    openDetailDialogFunc
}) => {
    const currentClassIsSelected = wdClass.id === selectedWdClass?.id;

    return (
        <>
            <ListItem
                key={wdClass.iri}
                role={undefined}
                dense
                button
                onClick={() => setSelectedWdClass(currentClassIsSelected ? undefined : wdClass)}
            >
                <ListItemIcon>
                    <Radio
                        edge='start'
                        checked={currentClassIsSelected}
                        tabIndex={-1}
                        disableRipple
                    />
                </ListItemIcon>
                <ListItemText
                    secondary={
                        <Box style={{ display: "flex", gap: "1em" }}>
                            <LanguageStringUndefineable from={wdClass.descriptions}>
                                {(text) =>
                                    text !== undefined ? (
                                        <Typography
                                            variant='body2'
                                            color='textSecondary'
                                            component={"span"}
                                            noWrap
                                            title={text}
                                        >
                                            {text}
                                        </Typography>
                                    ) : (
                                        <></>
                                    )
                                }
                            </LanguageStringUndefineable>
                        </Box>
                    }
                >
                    <strong>
                        <LanguageStringText from={wdClass.labels} />
                    </strong>
                </ListItemText>
                <IconButton 
                    size='small'
                    onClick={(event) => {
                        event.stopPropagation();
                        openDetailDialogFunc({wdEntity: wdClass})
                    }}>
                    <InfoTwoToneIcon fontSize='inherit' />
                </IconButton>
            </ListItem>
        </>
    );
};
