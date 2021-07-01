import React from "react";
import {PsmItemCommonAttributes, useItemStyles} from "./PsmItemCommon";
import {PsmClassParts} from "./PsmClassParts";
import {StoreContext} from "../App";
import {PimClass, PsmClass} from "model-driven-data";
import {AddButton} from "./class/AddButton";
import {Typography} from "@material-ui/core";
import {GetLabelAndDescription} from "./common/GetLabelAndDescription";

export const PsmRootClass: React.FC<PsmItemCommonAttributes> = ({id}) => {
    const {store} = React.useContext(StoreContext);
    const styles = useItemStyles();

    const cls = store[id] as PsmClass;
    const interpretedPim = cls.psmInterpretation ? store[cls.psmInterpretation] as PimClass : undefined;
    const interpretedCim = interpretedPim?.pimInterpretation;

    return <li className={styles.li}>
        <Typography className={styles.root}>
            <GetLabelAndDescription id={id}>
                {(label, description) =>
                    <span className={styles.class} title={description}>{label}</span>
                }
            </GetLabelAndDescription>
            {interpretedCim && <AddButton forClass={cls} />}
        </Typography>
        <PsmClassParts forClass={id} isOpen={true}/>
    </li>;
};
