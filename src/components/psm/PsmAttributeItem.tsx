import React from "react";
import {PsmAttribute} from "model-driven-data";
import {Typography} from "@material-ui/core";
import {AttributeDetailDialog} from "../psmDetail/AttributeDetailDialog";
import {StoreContext} from "../App";
import EditIcon from '@material-ui/icons/Edit';
import {useToggle} from "../../hooks/useToggle";
import {PsmItemCommonAttributes, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DeleteButton} from "./class/DeleteButton";
import {ActionButton} from "./common/ActionButton";
import RemoveIcon from '@material-ui/icons/Remove';
import {GetLabelAndDescription} from "./common/GetLabelAndDescription";

/**
 * Component rendering PSM attribute into a PSM tree
 * @param id string id of the attribute, because the attribute may not exists under the given store.
 * @param dragHandleProps
 */
export const PsmAttributeItem: React.FC<PsmItemCommonAttributes> = ({id, dragHandleProps, parent, index}) => {
    const dialog = useToggle();
    const {t} = useTranslation("psm");
    const styles = useItemStyles();

    const {store, psmModifyTechnicalLabel} = React.useContext(StoreContext);

    const attribute = store[id] as PsmAttribute;

    // @ts-ignore
    const attributeType = attribute.type ?? null;

    return <>
        <li className={styles.li}>
            <Typography className={styles.root}>
                <RemoveIcon style={{verticalAlign: "middle"}} />
                {' '}
                <GetLabelAndDescription id={id}>
                    {(label, description) =>
                        <span {...dragHandleProps} title={description} className={styles.attribute}>{label}</span>
                    }
                </GetLabelAndDescription>

                {!!(attribute.psmTechnicalLabel && attribute.psmTechnicalLabel.length) &&
                    <> (<span className={styles.technicalLabel}>{attribute.psmTechnicalLabel}</span>)</>
                }

                {attributeType && attributeType.length && <>
                    {': '}
                    <span className={styles.type}>{attributeType}</span>
                </>}

                <ActionButton onClick={dialog.open} icon={<EditIcon/>} label={t("button edit")}/>
                {parent && index !== undefined && <DeleteButton parent={parent} index={index} />}
            </Typography>
        </li>

        <AttributeDetailDialog store={store} attribute={attribute} isOpen={dialog.isOpen} close={dialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />
    </>;
};
