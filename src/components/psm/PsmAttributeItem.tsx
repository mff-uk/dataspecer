import React, {useCallback} from "react";
import {PsmAttribute} from "model-driven-data";
import {Chip} from "@material-ui/core";
import {AttributeDetailDialog} from "../psmDetail/AttributeDetailDialog";
import {StoreContext} from "../App";
import EditIcon from '@material-ui/icons/Edit';
import {PsmInterpretedAgainst} from "./PsmInterpretedAgainst";
import {useToggle} from "../../hooks/useToggle";
import {PsmDeleteItem, PsmItemCommonAttributes, usePsmItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {LanguageStringFallback, LanguageStringUndefineable} from "../helper/LanguageStringComponents";

const valueStyle = {
    fontFamily: "monospace",
    wordBreak: "break-all",
} as React.CSSProperties;


/**
 * Component rendering PSM attribute into a PSM tree
 * @param id string id of the attribute, because the attribute may not exists under the given store.
 * @param dragHandleProps
 */
export const PsmAttributeItem: React.FC<PsmItemCommonAttributes> = ({id, dragHandleProps, parent, index}) => {
    const dialog = useToggle();
    const {t} = useTranslation("psm");

    const {store, psmModifyTechnicalLabel} = React.useContext(StoreContext);

    const attribute = store[id] as PsmAttribute;

    const styles = usePsmItemStyles();

    // @ts-ignore
    const attributeType = attribute.type ?? null;

    return <>
        <li>
            <div className={styles.root}>
                <span {...dragHandleProps}>
                    {attribute.psmTechnicalLabel ?
                        <span className={`${styles.term} ${styles.attribute}`}>{attribute.psmTechnicalLabel}</span> : <span className={styles.attribute}>[{t('unlabeled')}]</span>}
                </span>

                {attributeType && attributeType.length && <>
                    {': '}
                    <span style={valueStyle}>{attributeType}</span>
                </>}

                <LanguageStringUndefineable from={attribute.psmHumanDescription}>
                    {description =>
                        <LanguageStringFallback from={attribute.psmHumanLabel}>{text => <>{' '}<span title={description}>{text}</span></>}</LanguageStringFallback>
                    }
                </LanguageStringUndefineable>

                {' '}
                    <PsmInterpretedAgainst store={store} entity={attribute}/>
                {' '}
                <Chip className={styles.chip} variant="outlined" size="small" onClick={dialog.open} icon={<EditIcon/>} label={t("button edit")}/>
                {' '}
                {parent && index !== undefined && <PsmDeleteItem parent={parent} index={index} />}
            </div>
        </li>

        <AttributeDetailDialog store={store} attribute={attribute} isOpen={dialog.isOpen} close={dialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />
    </>;
}
