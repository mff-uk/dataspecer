import { useEffect, useState } from "react";
import { EntityCatalog } from "./entity-catalog";
import { ModelCatalog } from "./model-catalog";
import { AttributeCatalog, RelationshipCatalog } from "./attribute-relationship-catalog";
import { useClassesContext } from "../context/classes-context";
import { ProfileCatalog } from "./profile-catalog";
import { isAttribute } from "../util/utils";

export const Catalog = () => {
    const [entityView, setEntityView] = useState<"class" | "relationship" | "attribute" | "profile">("class");
    const { relationships: r, /* attributes, */ profiles } = useClassesContext();

    const relationships = r.filter((v) => !isAttribute(v));
    const attributes = r.filter(isAttribute);

    if (entityView == "relationship" && relationships.length == 0) {
        setEntityView("class");
    } else if (entityView == "attribute" && attributes.length == 0) {
        setEntityView("class");
    } else if (entityView == "profile" && profiles.length == 0) {
        setEntityView("class");
    }

    return (
        <div className="grid h-full w-full grid-cols-1 grid-rows-[20%_80%]">
            <ModelCatalog />
            <div className="grid h-full grid-rows-[auto_1fr]">
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
                    {profiles.length > 0 && (
                        <button
                            disabled={entityView == "profile"}
                            onClick={() => setEntityView("profile")}
                            className={`${entityView == "profile" ? "font-bold" : ""}`}
                        >
                            profiles
                        </button>
                    )}
                </div>

                <div className="my-0 overflow-y-scroll pb-2">
                    {entityView == "class" && <EntityCatalog />}
                    {entityView == "relationship" && <RelationshipCatalog />}
                    {entityView == "attribute" && <AttributeCatalog />}
                    {entityView == "profile" && <ProfileCatalog />}
                </div>
            </div>
        </div>
    );
};
