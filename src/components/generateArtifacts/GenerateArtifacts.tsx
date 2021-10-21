import React, {useRef, useState} from "react";
import {Divider, Fab, Menu} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {useTranslation} from "react-i18next";
import {ReSpecArtifact} from "./ReSpecArtifact";
import {BikeshedArtifact} from "./BikeshedArtifact";
import {ObjectModelArtifact} from "./ObjectModelArtifact";
import {StoreContext} from "../App";

export const GenerateArtifacts: React.FC = () => {
    const {isOpen, open, close} = useToggle();
    const [ id ] = useState(() => uniqueId());
    const ref = useRef(null);
    const {t} = useTranslation("artifacts");
    const {psmSchemas} = React.useContext(StoreContext);


    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref} disabled={psmSchemas.length === 0}>
                {t("button generate load artifacts")}
                <ExpandMoreIcon />
            </Fab>
            <Menu
                id={id}
                anchorEl={ref.current}
                keepMounted
                open={isOpen}
                onClose={close}
            >
                <ReSpecArtifact close={close} />
                <Divider />
                <BikeshedArtifact close={close} />
                <Divider />
                <ObjectModelArtifact close={close} />
            </Menu>
        </>
    );
};
