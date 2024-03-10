import { useState } from "react";
import { useBackendConnection } from "../backend-connection";
import { usePackageSearch } from "../util/package-search";
import { Package } from "@dataspecer/core-v2/project";
import { getOneNameFromLanguageString } from "../util/utils";
import { useModelGraphContext } from "../context/model-context";
import { getRandomName } from "../../utils/random-gen";

export const PackageManagement = () => {
    const { listPackages, createPackage, updateSemanticModelPackageModels } = useBackendConnection();
    const { packageId, setPackage } = usePackageSearch();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [packages, setPackages] = useState([] as Package[]); // fixme: shouldn't be a state, should it?
    const { models, visualModels } = useModelGraphContext();

    const handlePackageSelected = (pkgId: string) => {
        setPackage(pkgId);
        toggleDropdown();
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const fetchPackagesFromBackend = async () => {
        setPackages(await listPackages());
    };

    return (
        <div className="my-auto">
            {/* 
        <div className="my-auto">
            <div className="flex flex-col [&]:text-[15px]">
                <div className="flex flex-row">
                    <div>
                        pkg:<span className="ml-2 font-mono">{packageId ?? "---"}</span>
                    </div>
                    <button className="white ml-2" title="change package" onClick={toggleDropdown}>
                        {dropdownOpen ? "🔼" : "🔽"}
                    </button>
                    <button
                        className="white ml-2"
                        title="sync package inventory with backend"
                        onClick={fetchPackagesFromBackend}
                    >
                        🔄
                    </button>
                    <button
                        className="mx-1 bg-yellow-600 px-1"
                        title="create a new package"
                        onClick={async () => {
                            const pkgName = getRandomName(7);
                            const pkg = await createPackage(pkgName, pkgName)
                                .then((resp) => resp)
                                .catch((reason) => {
                                    alert("there was a problem creating package on backend");
                                    console.error(reason);
                                });
                            if (pkg) {
                                setPackages((prev) => [...prev, pkg]);
                            }
                        }}
                    >
                        ➕pkg
                    </button> 
        */}
            <button
                className="bg-green-600 px-1"
                disabled={!packageId}
                title="save package to backend"
                onClick={async () => {
                    if (!packageId) {
                        return;
                    }

                    updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()]);
                }}
            >
                💾pkg
            </button>
            {/* 
                </div>
                {dropdownOpen && (
                    <ul className="absolute z-10 mt-8 flex flex-col bg-[#5438dc]">
                        {packages.map((pkg) => (
                            <li key={pkg.id} className="w-full">
                                <button onClick={() => handlePackageSelected(pkg.id)}>
                                    {getOneNameFromLanguageString(pkg.name)?.t ?? pkg.id}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div> 
        */}
        </div>
    );
};
