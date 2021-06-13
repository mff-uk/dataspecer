import React from "react";
import {Badge, Fab} from "@material-ui/core";
import {Store} from "model-driven-data";
import RestoreIcon from "@material-ui/icons/Restore";
import {LoadSavedDialog} from "./LoadSavedDialog";
import {useToggle} from "../../hooks/useToggle";

const LoadSavedButton: React.FC<{store: (store: Store) => void}> = ({store}) => {
    const {isOpen, open, close} = useToggle();
    return (
        <>
            <Badge badgeContent={"dočasné"} color="secondary">
                <Fab variant="extended" size="medium" color="primary" onClick={open}>
                    <RestoreIcon />
                    Load from Github
                </Fab>
            </Badge>
            <LoadSavedDialog isOpen={isOpen} close={close} store={store}/>
        </>
    );
};

export default LoadSavedButton;