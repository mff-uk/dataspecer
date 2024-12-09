import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";
import {useDialog} from "../../editor/dialog";
import {ImportDialog} from "./dialog";

export const ImportButton = () => {
    const {t} = useTranslation("ui", {keyPrefix: 'import'});
    const dialog = useDialog(ImportDialog);

    return <>
        <Button
            variant="contained"
            onClick={dialog.open}
        >
            {t("button import")}
        </Button>
        <dialog.Component />
    </>;
}