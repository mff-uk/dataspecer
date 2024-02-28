import {
    isSemanticModelClass,
    isSemanticModelRelationship,
    type SemanticModelClass,
    type SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { cardinalityToString } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import {
    getLanguagesForNamedThing,
    getNameOrIriAndDescription,
    getStringFromLanguageStringInLang,
} from "../util/language-utils";
import { IriLink } from "../catalog/entity-catalog-row";
import {
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useBaseDialog } from "./base-dialog";

type SupportedEntityType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage;

export const useEntityDetailDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedEntity, setViewedEntity] = useState(null as unknown as SupportedEntityType);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setViewedEntity(null as unknown as SupportedEntityType);
        close();
    };
    const localOpen = (entity: SupportedEntityType) => {
        setViewedEntity(entity);
        open();
    };
    const save = () => {
        close();
    };

    const EntityDetailDialog = () => {
        const [currentLang, setCurrentLang] = useState("en");

        const langs = getLanguagesForNamedThing(viewedEntity);
        let name = "",
            description = "",
            iri: null | string = null,
            usageNote: null | string = null,
            usageOf: null | string = null;

        if (isSemanticModelClassUsage(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)) {
            const [a, b] = getStringFromLanguageStringInLang(viewedEntity.name ?? {});
            const [c, d] = getStringFromLanguageStringInLang(viewedEntity.description ?? {});
            const [e, f] = getStringFromLanguageStringInLang(viewedEntity.usageNote ?? {});
            [name, description, usageNote, usageOf] = [
                (a ?? "no-name") + (b != null ? `@${b}` : ""),
                c ?? "" + (d != null ? `@${d}` : ""),
                e ?? "" + (f != null ? `@${f}` : ""),
                viewedEntity.usageOf,
            ];
        } else if (isSemanticModelClass(viewedEntity) || isSemanticModelRelationship(viewedEntity)) {
            const [a, b] = getNameOrIriAndDescription(viewedEntity, viewedEntity.iri || viewedEntity.id, currentLang);
            [name, description, iri] = [a ?? "no-iri", b ?? "", viewedEntity.iri];
        }

        const { classes: c, attributes: a } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == viewedEntity.id);

        const ends = isSemanticModelRelationship(viewedEntity) ? viewedEntity.ends : null;
        const domain = c.get(ends?.at(0)?.concept || "dfjkn23jb21828532923891")?.cls;
        const domainCardinality = cardinalityToString(ends?.at(0)?.cardinality);
        const range = c.get(ends?.at(1)?.concept || "tnrkemlf83904349820402")?.cls;
        const rangeCardinality = cardinalityToString(ends?.at(1)?.cardinality);

        console.log(ends, domain, viewedEntity);

        return (
            <BaseDialog heading="Entity detail">
                <div>
                    <h5>
                        Detail of: <span className="font-semibold">{name}</span>
                    </h5>
                    <div className="grid grid-cols-[80%_20%] grid-rows-1">
                        <p className="flex flex-row text-gray-500" title={iri ?? ""}>
                            <IriLink iri={iri} />
                            {iri}
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
                        {usageOf && <p className="flex flex-row text-gray-500">usage of: {usageOf}</p>}
                    </div>
                </div>
                <p>type: {viewedEntity.type}</p>
                <p>description: {description}</p>
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
                {usageNote && <p>usage note: {usageNote}</p>}
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
            </BaseDialog>
        );
    };

    return {
        isEntityDetailDialogOpen: isOpen,
        closeEntityDetailDialog: localClose,
        openEntityDetailDialog: localOpen,
        EntityDetailDialog,
    };
};
