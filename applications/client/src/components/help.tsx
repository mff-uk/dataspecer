import {FC, useRef} from "react";
import {styled} from "@mui/material/styles";
import {Button, ButtonGroup, ClickAwayListener, Grow, Popper} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useToggle} from "../manager/use-toggle";
import {useTranslation} from "react-i18next";

const HelpButton = styled(Button)(({ theme }) => ({
    color: theme.palette.warning.contrastText,
    backgroundColor: theme.palette.warning.main,
    "&:hover": {
        backgroundColor: theme.palette.warning.dark,
    },
    borderColor: theme.palette.warning.dark + " !important",
}));

export const Help: FC = () => {
    const {isOpen, open, close} = useToggle();
    const anchorRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation('ui');

    return <>
        <ButtonGroup variant="contained" ref={anchorRef} sx={{backgroundColor: theme => theme.palette.warning.main}}>
            {/* @ts-ignore target undefined */}
            <HelpButton target="_blank" href={process.env.REACT_APP_BUG_TRACKER_URL}>{t("report a bug")}</HelpButton>
            <HelpButton
                size="small"
                onClick={open}
            >
                <ArrowDropDownIcon />
            </HelpButton>
        </ButtonGroup>
        <Popper
            sx={{
                zIndex: 1,
                mt: ".5rem !important",
            }}
            open={isOpen}
            anchorEl={anchorRef.current}
            placement={"bottom-start"}
            role={undefined}
            transition
            disablePortal
        >
            {({ TransitionProps, placement }) => (
                <ClickAwayListener onClickAway={close}>
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        {/* @ts-ignore target undefined */}
                        <HelpButton target="_blank" href={process.env.REACT_APP_FEATURE_TRACKER_URL}>{t("request a feature")}</HelpButton>
                    </Grow>
                </ClickAwayListener>
            )}
        </Popper>
    </>;
}
