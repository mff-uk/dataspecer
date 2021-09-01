import React from "react";
import {useItemStyles} from "./PsmItemCommon";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {Typography} from "@material-ui/core";
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {PimClass} from "model-driven-data/pim/model";
import {Skeleton} from "@material-ui/lab";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";

export const DataPsmRootClassItem: React.FC<{dataPsmClassIri: string}> = ({dataPsmClassIri}) => {
    const styles = useItemStyles();

    const {dataPsmResource: dataPsmClass, pimResource: pimClass, isLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;

    return <li className={styles.li}>
        <Typography className={styles.root}>
            {dataPsmClass === undefined && <Skeleton />}
            {dataPsmClass &&
                <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                    {(label, description) =>
                        <span className={styles.class} title={description}>{label}</span>
                    }
                </DataPsmGetLabelAndDescription>
            }
            {cimClassIri && <DataPsmClassAddSurroundingsButton dataPsmClassIri={dataPsmClassIri} />}
        </Typography>

        {dataPsmClass && <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={false}/>}
    </li>;
};
