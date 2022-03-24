import React from "react";
import {MenuItem, Select, styled} from "@mui/material";

const MySelect = styled(Select)(() => `&::after,&::before {border-bottom: none !important}`);

export const FilterContext = React.createContext<[string, (update: string) => void]>(["_", () => null]);
export const AvailableTags = React.createContext<string[]>([]);

export const FilterByTag: React.FC = () => {
    const [filter, setFilter] = React.useContext(FilterContext);
    const tags = React.useContext(AvailableTags);
    return <MySelect
        value={filter}
        variant={"standard"}
        onChange={e => setFilter(e.target.value as string)}
    >
        <MenuItem value={"_"}><i>Show everything</i></MenuItem>
        {tags.map(tag => <MenuItem value={tag} key={tag}>{tag}</MenuItem>)}
    </MySelect>;
}
