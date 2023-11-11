import { useMemo, useState } from "react";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";

export const PackageManagement = () => {
    const { listPackages } = useBackendConnection();
    const { packageId, setPackage } = usePackageSearch();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const packages = useMemo(() => listPackages(), []);

    const handlePackageSelected = (pckgId: string) => {
        setPackage(pckgId);
        toggleDropdown();
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div className="my-auto">
            <div className="flex flex-col text-[15px]">
                <div className="flex flex-row">
                    <div>
                        package:<span className="ml-2 font-mono">{packageId}</span>
                    </div>
                    <button className="white ml-2 text-[15px]" onClick={toggleDropdown}>
                        🔍
                    </button>
                </div>
                {dropdownOpen && (
                    <ul className="absolute z-10 mt-8 flex flex-col bg-[#5438dc]">
                        {packages.map((pckg) => (
                            <li key={pckg} className="w-full">
                                <button onClick={() => handlePackageSelected(pckg)}>{pckg}</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        // <div className="my-auto text-[15px]">
        //     <div className=" bg-red-600 px-2">
        //         <button
        //             className="border border-rose-100 text-white"
        //             type="button"
        //             onClick={async () => {
        //                 const models = await getModelsFromBackend("florb");

        //                 console.log("got pckg from bakcend, ", models);
        //             }}
        //         >
        //             getPackage
        //         </button>
        //         <button
        //             className="border border-rose-100 text-white"
        //             type="button"
        //             onClick={async () => {
        //                 // await updateSemanticModelPackageModels(
        //                 //     "todo:packageId",
        //                 //     [...models.keys()].map((mId) => models.get(mId)!)
        //                 // );
        //             }}
        //         >
        //             updatePackage
        //         </button>
        //     </div>
        // </div>
    );
};
