import {
    isSemanticModelRelationship,
    type SemanticModelClass,
    type SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { cardinalityToString, clickedInside, isAttribute } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import {
    getLanguagesForNamedThing,
    getNameOrIriAndDescription,
    getStringFromLanguageStringInLang,
} from "../util/language-utils";
import { IriLink } from "../catalog/entity-catalog-row";

type SupportedEntityType = SemanticModelClass | SemanticModelRelationship;

export const useEntityDetailDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedEntity, setViewedEntity] = useState(null as unknown as SupportedEntityType);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
        setViewedEntity(null as unknown as SupportedEntityType);
    };
    const open = (entity: SupportedEntityType) => {
        setViewedEntity(entity);
        setIsOpen(true);
    };
    const save = () => {
        close();
    };

    const EntityDetailDialog = () => {
        const [currentLang, setCurrentLang] = useState("en");

        const langs = getLanguagesForNamedThing(viewedEntity);

        const [name, description] = getNameOrIriAndDescription(
            viewedEntity,
            viewedEntity.iri || viewedEntity.id,
            currentLang
        );

        const { classes: c, attributes: a } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == viewedEntity.id);

        const ends = isSemanticModelRelationship(viewedEntity) ? viewedEntity.ends : null;
        const domain = c.get(ends?.at(0)?.concept || "dfjkn23jb21828532923891")?.cls;
        const domainCardinality = cardinalityToString(ends?.at(0)?.cardinality);
        const range = c.get(ends?.at(1)?.concept || "tnrkemlf83904349820402")?.cls;
        const rangeCardinality = cardinalityToString(ends?.at(1)?.cardinality);

        console.log(ends, domain, viewedEntity);

        return (
            <dialog
                ref={editDialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = editDialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h5>
                        Detail of: <span className="font-semibold">{name}</span>
                    </h5>
                    <div className="grid grid-cols-[80%_20%] grid-rows-1">
                        <p className="flex flex-row text-gray-500" title={viewedEntity.iri ?? ""}>
                            <IriLink iri={viewedEntity.iri} />
                            {viewedEntity.iri}
                        </p>
                        <div>
                            <select
                                name="langs"
                                id="langs"
                                onChange={(e) => setCurrentLang(e.target.value)}
                                defaultValue={currentLang}
                            >
                                {langs.map((lang) => (
                                    <option value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <p>type: {viewedEntity.type}</p>
                <p>{description}</p>
                {attributes.length > 0 && (
                    <p>
                        attributes:
                        {attributes.map((v) => {
                            const attr = v.ends.at(1)!;
                            const [name, fallbackLang] = getStringFromLanguageStringInLang(attr.name, currentLang);
                            const [attributeDescription, fallbackAttributeDescriptionLang] =
                                getStringFromLanguageStringInLang(attr.description);

                            let descr = "";
                            if (attributeDescription && !fallbackAttributeDescriptionLang) {
                                descr = attributeDescription;
                            } else if (attributeDescription && fallbackAttributeDescriptionLang) {
                                descr = `${attributeDescription}@${fallbackAttributeDescriptionLang}`;
                            }

                            return (
                                <div title={descr}>
                                    {name}@{fallbackLang}
                                </div>
                            );
                        })}
                    </p>
                )}
                {domain && (
                    <p>
                        domain:
                        {getNameOrIriAndDescription(domain, domain?.iri || "domain-no-iri")[0]}: {domainCardinality}
                    </p>
                )}
                {range && (
                    <p>
                        range: {getNameOrIriAndDescription(range, range?.iri || "range-no-iri")[0]},{rangeCardinality}
                    </p>
                )}

                <div className="flex flex-row justify-evenly">
                    <button onClick={save}>confirm</button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isEntityDetailDialogOpen: isOpen,
        closeEntityDetailDialog: close,
        openEntityDetailDialog: open,
        EntityDetailDialog,
    };
};
