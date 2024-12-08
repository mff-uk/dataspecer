import React, {memo} from "react";
import {MenuItem, Select, styled} from "@mui/material";

const MySelect = styled(Select)(() => `&::after,&::before {border-bottom: none !important}`);

/**
 * Current tag used as a filter. Null means no filter.
 */
export const FilterContext = React.createContext<[string | null, (update: string | null) => void]>([null, () => null]);
export const AvailableTags = React.createContext<string[]>([]);

export const FilterByTagSelect = memo(() => {
    const [filter, setFilter] = React.useContext(FilterContext);
    const tags = React.useContext(AvailableTags);
    return <MySelect
        value={filter ?? "_"}
        variant={"standard"}
        onChange={e => setFilter(e.target.value === "_" ? null : e.target.value as string)}
    >
        <MenuItem value={"_"}><i>Show everything</i></MenuItem>
        {tags.map(tag => <MenuItem value={tag} key={tag}>{tag}</MenuItem>)}
    </MySelect>;
});
