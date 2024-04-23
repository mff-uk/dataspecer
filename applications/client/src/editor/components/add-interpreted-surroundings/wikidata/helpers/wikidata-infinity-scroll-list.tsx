import { WdEntityDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { List } from "@mui/material";
import { useState, ReactElement } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const ENTITIES_PER_PAGE = 50;

export interface WikidataInfinityScrollListProps<T extends WdEntityDescOnly> {
    wdEntities: T[];
    mapWdEntityFunc: (wdEntity: T) => ReactElement;
    scrollableTargetId: string;
}

export function WikidataInfinityScrollList<T extends WdEntityDescOnly>(props: WikidataInfinityScrollListProps<T>): ReactElement {
    const [listLength, setListLength] = useState(ENTITIES_PER_PAGE);
    
    const actualListLength = props.wdEntities.length < listLength ? props.wdEntities.length : listLength;

    return (
        <>
            <List>
                <InfiniteScroll
                    dataLength={actualListLength}
                    next={() => {
                        let newListLength = listLength + ENTITIES_PER_PAGE;
                        if (newListLength > props.wdEntities.length) newListLength = props.wdEntities.length;
                        setListLength(newListLength);
                    }}
                    hasMore={actualListLength < props.wdEntities.length}
                    scrollableTarget={props.scrollableTargetId}
                    loader={<p>Loading...</p>}
                >
                    {props.wdEntities.slice(0, actualListLength).map(props.mapWdEntityFunc)}
                </InfiniteScroll>
            </List>
        </>
    );
}