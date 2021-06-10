import {Store, PsmBase, PimBase} from "model-driven-data";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.disabled
        }
    }),
);

export const PsmInterpretedAgainst: React.FC<{store: Store, entity: PsmBase}> = ({store, entity}) => {
    const style = useStyles();

    if (entity.psmInterpretation) {
        const interpretation: PimBase | undefined = store[entity.psmInterpretation];
        return <span className={style.root} title={entity.psmInterpretation}>(interpreted{interpretation?.pimHumanLabel?.cs && <> against <strong>{interpretation.pimHumanLabel?.cs}</strong></>})</span>
    } else {
        return <span className={style.root} >(not interpreted)</span>;
    }
}
