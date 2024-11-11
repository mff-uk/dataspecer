import { BackendPackageService, type Package } from "@dataspecer/core-v2/project";
import { fetchService } from "../service/fetch-service";

export interface PackageService {
  /**
   * Fetch information about a package.
   */
  getPackage: (identifier: string) => Promise<Package>;
  /**
   * Return information about the root package.
   */
  getRootPackage: (identifier: string) => Promise<Package>;
}

 
const backendService = new BackendPackageService(import.meta.env.VITE_PUBLIC_APP_BACKEND!, fetchService.fetch);

 
const backendPackageRootUrl = import.meta.env.VITE_PUBLIC_APP_BACKEND_PACKAGE_ROOT!;

const getPackage = (identifier: string): Promise<Package> => {
  return backendService.getPackage(identifier);
};

const getRootPackage = () => getPackage(backendPackageRootUrl);

export const packageService: PackageService = {
  getPackage,
  getRootPackage,
};
