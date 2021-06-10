import {LegislativniSlovnikGlossary, SlovnikPimMetadata} from "model-driven-data";
import React from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.secondary.main
        },
    }),
);

export const GlossaryNote: React.FC<{entity: SlovnikPimMetadata}> = ({entity}) => <span className={useStyles().root}>
    {entity.glossary?.type}
    {entity.glossary && LegislativniSlovnikGlossary.is(entity.glossary) &&
    <strong>{` ${entity.glossary.number}/${entity.glossary.year} Sb.`}</strong>
    }
</span>
