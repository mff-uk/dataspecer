import { LanguageString, NamedThing, SEMANTIC_MODEL_CLASS, SEMANTIC_MODEL_GENERALIZATION, SEMANTIC_MODEL_RELATIONSHIP, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from '@dataspecer/core-v2/semantic-model/concepts';
import { RdfMemorySource } from '@dataspecer/core/io/rdf/rdf-memory-source';
import { Literal, NamedNode, Quad, Store } from 'n3';
import { Entity } from '../../core-v2/lib/entity-model/entity';
import { RDFS, OWL, SCHEMAORG, RDF } from './rdfs-vocabulary';
import { getQuadsByMany, objectsToLanguageString } from './better-n3-store';

/**
 * Adapter from RDFS, OWL to the semantic model.
 */
export class RdfsAdapter {
    private entities: Record<string, SemanticModelEntity> = {};

    public options = {
        classType: [RDFS.Class, OWL.Class],
        propertyDomain: [RDFS.domain],
        propertyDomainIncludes: [SCHEMAORG.domainIncludes],
        propertyRange: [RDFS.range],
        propertyRangeIncludes: [SCHEMAORG.rangeIncludes],
        property: [RDF.property,  "http://www.w3.org/2002/07/owl#FunctionalProperty", OWL.DatatypeProperty, OWL.ObjectProperty],
        propertyDescription: ["http://www.w3.org/ns/prov#definition", "http://www.w3.org/2000/01/rdf-schema#comment"]
    }

    load(input: Store) {
        // Start with loading classes and generalizations
        {
            const possibleClasses = getQuadsByMany(input, null, RDF.type, this.options.classType).map(q => q.subject);
            const namedNodes = possibleClasses.filter(subject => subject.termType === 'NamedNode') as NamedNode[];
            for (const subject of namedNodes) {
                this.entities[subject.value] = this.loadClass(subject, input);
                const subClasses = input.getObjects(subject, 'http://www.w3.org/2000/01/rdf-schema#subClassOf', null);
                for (const parentClass of subClasses) {
                    if (parentClass.termType !== 'NamedNode') {
                        continue;
                    }
                    const generalization = this.getGeneralization(subject, parentClass);
                    this.entities[generalization.id] = generalization;
                }
            }
        }
        // Identify properties
        {
            const possibleProperties = getQuadsByMany(input, null, RDF.type, this.options.property).map(q => q.subject);
            const namedNodes = possibleProperties.filter(subject => subject.termType === 'NamedNode') as NamedNode[];
            for (const property of namedNodes) {
                const prop = this.loadRelation(property, input);
                if (prop) {
                    this.entities[prop.id] = prop;
                }
            }
        }
    }

    private loadClass(subject: NamedNode, input: Store): SemanticModelClass {
        return {
            id: subject.value,
            iri: subject.value,
            type: [SEMANTIC_MODEL_CLASS],
            ...this.getNameAndDescription(subject, input)
        }
    }

    private loadRelation(subject: NamedNode, input: Store): SemanticModelRelationship | null {
        const domain = getQuadsByMany(input, subject, this.options.propertyDomain).map(q => q.object);
        const range = getQuadsByMany(input, subject, this.options.propertyRange).map(q => q.object);

        let domainIri: string;
        if (domain.length === 0) {
            domainIri = OWL.Thing;
        } else {
            domainIri = domain[0].value;
            // todo
        }

        let rangeIri: string;
        if (range.length === 0) {
            rangeIri = OWL.Thing;
        } else {
            rangeIri = range[0].value;
            // todo
        }

        return {
            id: subject.value,
            iri: null, // by definition
            type: [SEMANTIC_MODEL_RELATIONSHIP],
            name: {},
            description: {},
            ends: [
                { // Domain end
                    name: {},
                    description: {},
                    iri: null,
                    concept: domainIri,
                },
                { // Range end
                    ...this.getNameAndDescription(subject, input),
                    iri: subject.value,
                    concept: rangeIri,
                }
            ],
        }
    }

    private getGeneralization(child: NamedNode, parent: NamedNode): SemanticModelGeneralization {
        return {
            id: `${child.value}-${parent.value}`, // todo: generate valid URLs
            iri: null, // null because does not make sense
            type: [SEMANTIC_MODEL_GENERALIZATION],
            child: child.value,
            parent: parent.value,
        }
    }

    private getNameAndDescription(subject: NamedNode, input: Store): NamedThing {
        return {
            name: objectsToLanguageString(getQuadsByMany(input, subject, "http://www.w3.org/2000/01/rdf-schema#label").map(q => q.object)),
            description: objectsToLanguageString(getQuadsByMany(input, subject, this.options.propertyDescription).map(q => q.object)),
        };
    }

    getEntities(): SemanticModelEntity[] {
        return Object.values(this.entities);
    }
}