import React, {useContext, useEffect, useMemo, useState} from 'react';
import {AppBar, Box, Container, Divider, Toolbar, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {StoreContext, useNewFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {useConstructedStoresFromDescriptors} from "./utils/use-stores-by-descriptors";
import {DataSpecifications} from "./data-specifications";
import {CoreResourceReader} from "@dataspecer/core/core";
import {AvailableTags, FilterContext} from "./routes/home/filter-by-tag-select";
import {useLocalStorage} from "./utils/use-local-storage";
import {SnackbarProvider} from 'notistack';
import {BackendConnectorContext} from "../application";
import {Help} from "../components/help";
import {ReturnBackButton} from "../components/return-back/return-back-button";

export const DataSpecificationsContext = React.createContext({
    dataSpecifications: {} as DataSpecifications,
    setDataSpecifications: (dataSpecifications: DataSpecifications) => {},
    rootDataSpecificationIris: [] as string[],
    setRootDataSpecificationIris: (rootDataSpecificationIris: string[]) => {},
});

export const ConstructedStoreCacheContext = React.createContext<Map<StoreDescriptor, CoreResourceReader>>(new Map());

function App(props: {children: React.ReactNode}) {
    /**
     * Cached data specifications. Not necessary all of them are shown on the front page.
     */
    const [dataSpecifications, setDataSpecifications] = useState<DataSpecifications>({});

    /**
     * Specifications that are shown on the front page.
     */
    const [rootDataSpecificationIris, setRootDataSpecificationIris] = useState<string[]>([]);

    const backendConnector = useContext(BackendConnectorContext);
    useEffect(() => {
        backendConnector.readDataSpecifications().then(spec => {
            setDataSpecifications(Object.fromEntries(spec.map(s => [s.iri, s])));
            setRootDataSpecificationIris(spec.map(s => s.iri as string));
        });
    }, [backendConnector]);

    // Create a root FederatedObservableStore and add all PIM stores to it.

    const store = useNewFederatedObservableStore();
    const pimStoreDescriptors = useMemo(() => Object.values(dataSpecifications).reduce(
        (accumulator, currentValue) =>
            [...accumulator, ...currentValue.pimStores],
        [] as StoreDescriptor[],
    ), [dataSpecifications]);

    useEffect(() => {
        (window as any).store = store;
    }, [store]);

    // Stores that are already constructed may be used for generators.
    const constructedStoreCache = useConstructedStoresFromDescriptors(pimStoreDescriptors, store);

    const dataSpecificationContext = useMemo(() => ({
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    }), [
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    ]);

    // Basic filtering

    const filter = useLocalStorage<string>("filter-by-tag", null);
    const tags = useMemo(() =>
        [...new Set(Object.values(dataSpecifications)
            .filter(ds => rootDataSpecificationIris.includes(ds.iri as string))
            .reduce((previousValue, currentValue) => [...previousValue, ...currentValue.tags], [] as string[]))] as string[]
    , [dataSpecifications, rootDataSpecificationIris]);

    return (
            <DataSpecificationsContext.Provider value={dataSpecificationContext}>
                <StoreContext.Provider value={store}>
                    <ConstructedStoreCacheContext.Provider value={constructedStoreCache}>
                        <AvailableTags.Provider value={tags}>
                            <FilterContext.Provider value={filter}>
                                <SnackbarProvider maxSnack={3}>
                                    <AppBar position="static" sx={{background: "#3f51b5 linear-gradient(5deg, #5d2f86, #3f51b5);"}}>
                                        <Toolbar>
                                            <Typography variant="h6" component={Link} to={`/`} sx={{color: "white", textDecoration: "none", fontWeight: "normal"}}>
                                                <strong>Dataspecer</strong> specification manager
                                            </Typography>
                                            <ReturnBackButton />
                                            <Box display="flex" sx={{flexGrow: 1, gap: 4}} justifyContent="flex-end">
                                                <Help />
                                            </Box>
                                        </Toolbar>
                                    </AppBar>
                                    <Container>
                                        {props.children}
                                        <Divider style={{margin: "1rem 0 1rem 0"}} />
                                        {process.env.REACT_APP_DEBUG_VERSION !== undefined &&
                                            <>
                                                Version: <span>{process.env.REACT_APP_DEBUG_VERSION}</span>
                                            </>
                                        }
                                    </Container>
                                </SnackbarProvider>
                            </FilterContext.Provider>
                        </AvailableTags.Provider>
                    </ConstructedStoreCacheContext.Provider>
                </StoreContext.Provider>
            </DataSpecificationsContext.Provider>
    );
}

export default App;
