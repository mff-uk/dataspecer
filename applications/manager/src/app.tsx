import React, {useEffect, useMemo, useState} from 'react';
import {AppBar, Container, Divider, Toolbar, Typography} from "@mui/material";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {Home} from "./routes/home/home";
import {Specification} from "./routes/specification/specification";
import {BackendConnector} from "@dataspecer/backend-utils/connectors/backend-connector";
import {StoreContext, useNewFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {useConstructedStoresFromDescriptors} from "./utils/use-stores-by-descriptors";
import {DataSpecifications} from "./data-specifications";
import {CoreResourceReader} from "@dataspecer/core/core";
import {AvailableTags, FilterContext} from "./routes/home/filter-by-tag";
import {useLocalStorage} from "./utils/use-local-storage";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";

export const DataSpecificationsContext = React.createContext({
    dataSpecifications: {} as DataSpecifications,
    setDataSpecifications: (dataSpecifications: DataSpecifications) => {},
    rootDataSpecificationIris: [] as string[],
    setRootDataSpecificationIris: (rootDataSpecificationIris: string[]) => {},
});

export const BackendConnectorContext = React.createContext(null as unknown as BackendConnector);

export const ConstructedStoreCacheContext = React.createContext<Map<StoreDescriptor, CoreResourceReader>>(new Map());

function App() {
    /**
     * Cached data specifications. Not necessary all of them are shown on the front page.
     */
    const [dataSpecifications, setDataSpecifications] = useState<DataSpecifications>({});

    /**
     * Specifications that are shown on the front page.
     */
    const [rootDataSpecificationIris, setRootDataSpecificationIris] = useState<string[]>([]);


    const [backendConnector] = useState(new BackendConnector(process.env.REACT_APP_BACKEND, httpFetch));
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

    const filter = useLocalStorage<string>("filter-by-tag", "_");
    const tags = useMemo(() =>
        [...new Set(Object.values(dataSpecifications)
            .filter(ds => rootDataSpecificationIris.includes(ds.iri as string))
            .reduce((previousValue, currentValue) => [...previousValue, ...currentValue.tags], [] as string[]))]
    , [dataSpecifications, rootDataSpecificationIris]);

    return (
        <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
            <DataSpecificationsContext.Provider value={dataSpecificationContext}>
                <BackendConnectorContext.Provider value={backendConnector}>
                    <StoreContext.Provider value={store}>
                        <ConstructedStoreCacheContext.Provider value={constructedStoreCache}>
                            <AvailableTags.Provider value={tags}>
                                <FilterContext.Provider value={filter}>
                                    <AppBar position="static">
                                        <Toolbar>
                                            <Typography variant="h6" component={Link} to={`/`} sx={{color: "white", textDecoration: "none", fontWeight: "normal"}}>
                                                <strong>Dataspecer</strong> specification manager
                                            </Typography>
                                        </Toolbar>
                                    </AppBar>
                                    <Container>
                                        <Routes>
                                            <Route path="/" element={<Home/>}/>
                                            <Route path="/specification" element={<Specification/>}/>
                                        </Routes>
                                        <Divider style={{margin: "1rem 0 1rem 0"}} />
                                        Report a bug on <a href="https://github.com/mff-uk/dataspecer/issues">GitHub</a>.
                                        {process.env.REACT_APP_DEBUG_VERSION !== undefined &&
                                            <>
                                                {" | "}Version: <span>{process.env.REACT_APP_DEBUG_VERSION}</span>
                                            </>
                                        }
                                    </Container>
                                </FilterContext.Provider>
                            </AvailableTags.Provider>
                        </ConstructedStoreCacheContext.Provider>
                    </StoreContext.Provider>
                </BackendConnectorContext.Provider>
            </DataSpecificationsContext.Provider>
        </BrowserRouter>
    );
}

export default App;
