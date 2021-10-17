import React, {useRef, useState} from "react";
import {Divider, Fab, Menu} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {useTranslation} from "react-i18next";
import {ReSpecArtifact} from "./ReSpecArtifact";
import {BikeshedArtifact} from "./BikeshedArtifact";
//import {SaveLoad} from "./SaveLoad";
import {ObjectModelArtifact} from "./ObjectModelArtifact";

export const GenerateArtifacts: React.FC = () => {
    const {isOpen, open, close} = useToggle();
    const [ id ] = useState(() => uniqueId());
    const ref = useRef(null);
    const {t} = useTranslation("artifacts");

    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref}>
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
                {/*<SaveLoad close={close} />
                <Divider />*/}
                <ReSpecArtifact close={close} />
                <Divider />
                <BikeshedArtifact close={close} />
                <Divider />
                <ObjectModelArtifact close={close} />
            </Menu>
        </>
    );
};
