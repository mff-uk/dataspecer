import React, {useRef} from "react";
import {Menu, MenuItem} from "@mui/material";
import {useTranslation} from "react-i18next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useToggle} from "../../../hooks/use-toggle";

/**
 * Creates a menu "More" button with a submenu as child.
 * @param children
 * @constructor
 */
export const ActionsOther: React.FC<{
    children: (close: () => void) => React.ReactNode
}> = ({children}) => {
    const {t} = useTranslation("ui");
    const ref = useRef(null);
    const {isOpen, open, close} = useToggle();

    return <>
        <MenuItem
            onClick={open}
            title={t("more")}
            ref={ref}>
            <MoreVertIcon />
        </MenuItem>
        <Menu
            anchorEl={ref.current}
            open={isOpen}
            onClose={close}
        >
            {children(close)}
        </Menu>
    </>;
}
