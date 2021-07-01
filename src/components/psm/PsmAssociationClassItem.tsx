import React from "react";
import {PimClass, PsmAssociation, PsmClass} from "model-driven-data";
import {StoreContext} from "../App";
import EditIcon from "@material-ui/icons/Edit";
import {AssociationDetailDialog} from "../psmDetail/AssociationDetailDialog";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {PsmItemCommonAttributes, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {PsmClassParts} from "./PsmClassParts";
import {ActionButton} from "./common/ActionButton";
import {AddButton} from "./class/AddButton";
import {DeleteButton} from "./class/DeleteButton";
import {IconButton, Typography} from "@material-ui/core";
import AccountTreeTwoToneIcon from '@material-ui/icons/AccountTreeTwoTone';
import {GetLabelAndDescription} from "./common/GetLabelAndDescription";

/**
 * This component represents either PSM class or PSM association to a PSM class.
 */
export const PsmAssociationClassItem: React.FC<PsmItemCommonAttributes> = ({id, dragHandleProps, parent, index}) => {
    const {store, psmModifyTechnicalLabel} = React.useContext(StoreContext);
    const {t} = useTranslation("psm");
    const styles = useItemStyles();

    const association = store[id] as PsmAssociation;
    const cls = association ? store[association.psmParts[0]] as PsmClass : store[id] as PsmClass;

    const interpretedCim = cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimInterpretation;

    const editDialog = useToggle();
    const collapse = useToggle(true);


    return <li className={styles.li}>
        <Typography className={styles.root}>
            <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />
            {collapse.isOpen ?
                <IconButton size={"small"} onClick={collapse.close}><ExpandMoreIcon /></IconButton> :
                <IconButton size={"small"} onClick={collapse.open}><ExpandLessIcon /></IconButton>
            }
            <GetLabelAndDescription id={association.id}>
                {(label, description) =>
                    <span {...dragHandleProps} title={description} className={styles.association}>{label}</span>
                }
            </GetLabelAndDescription>
            {': '}
            <GetLabelAndDescription id={cls.id}>
                {(label, description) =>
                    <span title={description} className={styles.class}>{label}</span>
                }
            </GetLabelAndDescription>

            {' '}

            {!!(association.psmTechnicalLabel && association.psmTechnicalLabel.length) &&
            <>(<span className={styles.technicalLabel}>{association.psmTechnicalLabel}</span>)</>
            }

            {interpretedCim && <AddButton forClass={cls} />}
            {association && <>
                <ActionButton onClick={editDialog.open} icon={<EditIcon/>} label={t("button edit")} />
                {parent && index !== undefined && <DeleteButton parent={parent} index={index} />}
            </>}
        </Typography>
        <PsmClassParts forClass={cls.id} isOpen={collapse.isOpen} />

       {association && <AssociationDetailDialog store={store} association={association} isOpen={editDialog.isOpen} close={editDialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />}
    </li>;
};
