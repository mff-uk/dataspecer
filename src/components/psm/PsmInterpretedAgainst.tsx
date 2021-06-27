import {Store, PsmBase, PimBase} from "model-driven-data";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React from "react";
import {LanguageStringFallback, LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.disabled
        }
    }),
);

export const PsmInterpretedAgainst: React.FC<{store: Store, entity: PsmBase}> = ({store, entity}) => {
    const style = useStyles();
    const {t} = useTranslation("psm")

    if (entity.psmInterpretation) {
        const interpretation: PimBase | undefined = store[entity.psmInterpretation];
        const cimInterpretation = interpretation?.pimInterpretation;

        return <span className={style.root}>
            (<LanguageStringUndefineable from={interpretation?.pimHumanDescription}>
                {description =>
                    <LanguageStringFallback
                        from={interpretation?.pimHumanLabel}
                        fallback={<span title={entity.psmInterpretation}>{t("interpreted")}</span>}
                    >{text => <strong title={description}>{text}</strong>}</LanguageStringFallback>
                }
            </LanguageStringUndefineable>
            {cimInterpretation && <>{' > '}<span title={cimInterpretation}>{t("cim resource")}</span></>}
            )
        </span>
    } else {
        return <span className={style.root} >({t("not interpreted")})</span>;
    }
}
