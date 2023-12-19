import { useMemo, useState } from "react";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { Package } from "@dataspecer/core-v2/project";
import { getOneNameFromLanguageString } from "./util/utils";
import { useModelGraphContext } from "./context/graph-context";

export const PackageManagement = () => {
    const { listPackages, createPackage, updateSemanticModelPackageModels } = useBackendConnection();
    const { packageId, setPackage } = usePackageSearch();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [packages, setPackages] = useState([] as Package[]); // fixme: shouldn't be a state, should it?
    const { models } = useModelGraphContext();

    // const packages = useMemo(() => listPackages(), []);

    const handlePackageSelected = (pckgId: string) => {
        console.log("package-management: selected a new package:", pckgId);
        setPackage(pckgId);
        toggleDropdown();
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div className="my-auto">
            <div className="flex flex-col [&]:text-[15px]">
                <div className="flex flex-row">
                    <div>
                        package:<span className="ml-2 font-mono">{packageId}</span>
                    </div>
                    <button className="white ml-2" onClick={toggleDropdown}>
                        🔍
                    </button>
                    <button
                        className="mx-1 bg-yellow-600 px-1"
                        onClick={async () => {
                            const pckg = await createPackage("demo-925", "můj-demo-925-pekič");
                            setPackages((prev) => [...prev, pckg]);
                        }}
                    >
                        create pckg
                    </button>
                    <button
                        className="bg-green-600 px-1"
                        onClick={async () => {
                            if (!packageId) {
                                return;
                            }
                            updateSemanticModelPackageModels(
                                packageId,
                                [...models.keys()].map((modelId) => models.get(modelId)!)
                            );
                        }}
                    >
                        save pckg
                    </button>
                </div>
                {dropdownOpen && (
                    <ul className="absolute z-10 mt-8 flex flex-col bg-[#5438dc]">
                        {packages.map((pckg) => (
                            <li key={pckg.id} className="w-full">
                                <button onClick={() => handlePackageSelected(pckg.id)}>
                                    {getOneNameFromLanguageString(pckg.name)}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
