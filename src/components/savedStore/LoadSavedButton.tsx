import React, {useState} from "react";
import { Fab } from "@material-ui/core";
import { PimClass } from "model-driven-data";
import RestoreIcon from "@material-ui/icons/Restore";
import {LoadSavedDialog} from "./LoadSavedDialog";
import {Store} from "model-driven-data";
import { Badge } from "@material-ui/core";

const LoadSavedButton: React.FC<{store: (store: Store) => void}> = ({store}) => {
    const [isOpen, setOpen] = useState(false);

    const open = () => setOpen(true);
    const close = () => setOpen(false);

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