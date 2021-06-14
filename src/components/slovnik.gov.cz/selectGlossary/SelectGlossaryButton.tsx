import {Badge, Button} from "@material-ui/core";
import React from "react";

export const SelectGlossaryButton: React.FC = () => {
    return <Badge badgeContent={"filtered"} color="primary"><Button variant="contained">Filter results</Button></Badge>
}