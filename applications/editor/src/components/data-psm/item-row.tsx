import React from "react";
import {Box, Fade, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
import Tooltip, {tooltipClasses} from "@mui/material/Tooltip";
import {useToggle} from "../../hooks/use-toggle";
import {DataPsmItemTreeContext} from "./data-psm-item-tree-context";

const LightTooltip = styled<typeof Tooltip>(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }}   TransitionComponent={Fade}
             TransitionProps={{ timeout: 200 }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.background.paper,
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: "1rem",
        padding: 0,
        marginLeft: 0,
    },
}));

const Content = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof Typography>>((props, ref) => {
    return (
        <Typography {...props} sx={{lineHeight: 1.9}}>
            {props.children}
            <span ref={ref} />
        </Typography>
    );
});

export const ItemRow: React.FC<{
    children: React.ReactNode;
    actions?: React.ReactNode;
    open?: boolean;
    readOnly?: boolean;
}> = ({children, actions, open, readOnly}) => {
    const toggle = useToggle(open ?? false);
    const {ignoreReadOnlyStyles} = React.useContext(DataPsmItemTreeContext);

    return <LightTooltip
        title={actions ? <Box sx={{display: "flex"}}>{actions}</Box> : false}
        placement={"right"}
        open={toggle.isOpen}
        onOpen={toggle.open}
        onClose={toggle.close}
    >
        <Content style={{opacity: readOnly && !ignoreReadOnlyStyles ? 0.5 : 1}}>
            {children}
        </Content>
    </LightTooltip>;
};
