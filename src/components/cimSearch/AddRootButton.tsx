import React from "react";
import {Fab} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {SearchDialog} from "./SearchDialog";
import {PimClass} from "model-driven-data";
import {useToggle} from "../../hooks/useToggle";

const AddRootButton: React.FC<{selected: (cls: PimClass) => void}> = ({selected}) => {
    const {isOpen, open, close} = useToggle();
    return (
        <>
            <Fab variant="extended" size="medium" color="primary" onClick={open}>
                <AddIcon />
                Add root element
            </Fab>
            <SearchDialog isOpen={isOpen} close={close} selected={selected}/>
        </>
    );
};

export default AddRootButton;