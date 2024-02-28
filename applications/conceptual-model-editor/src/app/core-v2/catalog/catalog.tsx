import { useState } from "react";
import { EntityCatalog } from "./entity-catalog";
import { ModelCatalog } from "./model-catalog";
import { AttributeCatalog, RelationshipCatalog } from "./attribute-relationship-catalog";
import { useClassesContext } from "../context/classes-context";
import { UsageCatalog } from "./usage-catalog";

export const Catalog = () => {
    const [entityView, setEntityView] = useState<"class" | "relationship" | "attribute" | "usage">("class");
    const { relationships, attributes, usages } = useClassesContext();

    return (
        <div className="grid h-full w-full grid-cols-1 grid-rows-[20%_80%]">
            <ModelCatalog />
            <div className="h-full pb-2">
                <div className="flex flex-row [&>*]:mx-2">
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
                    {usages.length > 0 && (
                        <button
                            disabled={entityView == "usage"}
                            onClick={() => setEntityView("usage")}
                            className={`${entityView == "usage" ? "font-bold" : ""}`}
                        >
                            usages
                        </button>
                    )}
                </div>

                <div className="h-full overflow-y-scroll pb-2">
                    {entityView == "class" && <EntityCatalog />}
                    {entityView == "relationship" && <RelationshipCatalog />}
                    {entityView == "attribute" && <AttributeCatalog />}
                    {entityView == "usage" && <UsageCatalog />}
                </div>
            </div>
        </div>
    );
};
