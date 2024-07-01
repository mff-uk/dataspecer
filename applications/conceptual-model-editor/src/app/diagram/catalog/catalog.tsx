import { useState } from "react";
import { EntityCatalog } from "./entity-catalog";
import { ModelCatalog } from "./model-catalog";
import { AttributeCatalog } from "./attribute-catalog";
import { RelationshipCatalog } from "./relationship-catalog";
import { useClassesContext } from "../context/classes-context";
import { ProfileCatalog } from "./profile-catalog";
import { isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { WarningCatalog } from "./warning-catalog";
import { useWarningsContext } from "../context/warnings-context";

export const Catalog = () => {
    const [entityView, setEntityView] = useState<"class" | "relationship" | "attribute" | "profile" | "warning">(
        "class"
    );
    const { relationships: r, profiles } = useClassesContext();
    const { warnings } = useWarningsContext();

    const relationships = r.filter((v) => !isSemanticModelAttribute(v));
    const attributes = r.filter(isSemanticModelAttribute);

    if (entityView == "relationship" && relationships.length == 0) {
        setEntityView("class");
    } else if (entityView == "attribute" && attributes.length == 0) {
        setEntityView("class");
    } else if (entityView == "profile" && profiles.length == 0) {
        setEntityView("class");
    }

    return (
        <div className="grid h-full w-full grid-cols-1 md:grid-rows-[20%_80%]">
            <ModelCatalog />
            <div className="grid h-full grid-rows-[auto_1fr]">
                {/* 
                --- selection header --- --- ---
                */}
                <div className="flex flex-row py-2 md:py-0 [&>*]:mx-2">
                    <button
                        disabled={entityView == "class"}
                        onClick={() => setEntityView("class")}
                        className={`${entityView == "class" ? "font-bold" : ""}`}
                    >
                        classes
                    </button>

                    {relationships.length > 0 && (
                        <button
                            disabled={entityView == "relationship"}
                            onClick={() => setEntityView("relationship")}
                            className={`${entityView == "relationship" ? "font-bold" : ""}`}
                        >
                            relationships
                        </button>
                    )}
                    {attributes.length > 0 && (
                        <button
                            disabled={entityView == "attribute"}
                            onClick={() => setEntityView("attribute")}
                            className={`${entityView == "attribute" ? "font-bold" : ""}`}
                        >
                            attributes
                        </button>
                    )}
                    {profiles.length > 0 && (
                        <button
                            disabled={entityView == "profile"}
                            onClick={() => setEntityView("profile")}
                            className={`${entityView == "profile" ? "font-bold" : ""}`}
                        >
                            profiles
                        </button>
                    )}
                    {warnings.length > 0 && (
                        <button
                            disabled={entityView == "warning"}
                            onClick={() => setEntityView("warning")}
                            className={`text-orange-500 ${entityView == "warning" ? "font-bold" : "font-semibold "}`}
                        >
                            ⚠️warnings
                        </button>
                    )}
                </div>
                <div className="my-0 overflow-y-scroll pb-2">
                    {entityView == "class" && <EntityCatalog />}
                    {entityView == "relationship" && <RelationshipCatalog />}
                    {entityView == "attribute" && <AttributeCatalog />}
                    {entityView == "profile" && <ProfileCatalog />}
                    {entityView == "warning" && <WarningCatalog />}
                </div>
            </div>
        </div>
    );
};
