import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { initializePackageState, PackageState } from "./package-state";
import { parseUrlQuery } from "./url-query";
import { createPackageContextApi, PackageApi } from "./package-api";

const packageContext = createContext<PackageState>(null as any);

const packageApiContext = createContext<PackageApi>(null as any);

/**
 * The application should use this method to get access to package functionality.
 * From there the values can be passed to context provider.
 *
 * The objective is to allow for loading state without forcing
 * the rest of the application to deal with null in the package contexts.
 */
export const usePackage: () => {
  packageContext: PackageState | null,
  packageContextApi: PackageApi,
} = () => {
  // We use "ref" to have current value for API.
  const packageContextRef = useRef<PackageState | null>(null);
  const [packageContext, setPackageContextState] =
    useState<PackageState | null>(null);

  // We need to keep state and ref synched.
  const setPackageContext = useCallback((next: PackageState | null) => {
    packageContextRef.current = next;
    setPackageContextState(next);
  }, [setPackageContextState]);

  // State.
  useEffect(() => {
    const url = parseUrlQuery();
    return initializePackageState(url.package, url.view, setPackageContext);
  }, [setPackageContext]);

  // API.
  const packageContextApi = useMemo((): PackageApi => {
    return createPackageContextApi(
      () => packageContextRef.current,
      setPackageContext
    )
  }, [packageContextRef, setPackageContext]);

  return {
    packageContext,
    packageContextApi,
  };
}

export const PackageContextProvider = (props: {
  children: React.ReactNode,
  context: PackageState,
  api: PackageApi,
}) => {
  return (
    <packageContext.Provider value={props.context}>
      <packageApiContext.Provider value={props.api}>
        {props.children}
      </packageApiContext.Provider>
    </packageContext.Provider>
  );
}

export const usePackageContext = (): PackageState => {
  return useContext(packageContext);
}

export const usePackageApiContext = (): PackageApi => {
  return useContext(packageApiContext);
}
