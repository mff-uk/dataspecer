import React from "react";
import {createStyles, makeStyles} from "@mui/styles";
import {StoreContext} from "../App";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {alpha, Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.primary.main,
            marginLeft: ".5rem",
            background: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
            padding: ".2rem .5rem",
            borderRadius: theme.shape.borderRadius
        },
    }),
);

export const SlovnikGovCzGlossary: React.FC<{cimResourceIri: string}> = ({cimResourceIri}) => {
    const {cim} = React.useContext(StoreContext);
    const [groups] = useAsyncMemo(() => cim.cimAdapter.getResourceGroup(cimResourceIri), [cimResourceIri, cim.cimAdapter]);
    const styles = useStyles();

    if (groups) {
        return <>{groups.map(group => {
            const chunks = group.substr("https://slovník.gov.cz/".length).split("/");
            switch (chunks[0]) {
                case "legislativní":
                    return <span className={styles.root} key={group}>{chunks[0]} <strong>{chunks[2]}/{chunks[3]} Sb.</strong></span>;
                case "agendový":
                    return <span className={styles.root} key={group}>{chunks[0]} <strong>{chunks[1]}</strong></span>;
                default:
                    return <span className={styles.root} key={group}>{chunks[0]}</span>;
            }
        })}</>;
    } else {
        return null;
    }
}
