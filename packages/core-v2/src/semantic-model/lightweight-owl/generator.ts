import {
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
    LanguageString,
    SemanticModelClass,
    SemanticModelEntity,
    SemanticModelGeneralization,
    SemanticModelRelationship
} from "../concepts/concepts";
import * as N3 from "n3";
import {DataFactory, Quad_Predicate, Quad_Subject} from "n3";
import namedNode = DataFactory.namedNode;
import literal = DataFactory.literal;


function simpleIdSort(a: SemanticModelEntity, b: SemanticModelEntity) {
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Generates lightweight OWL ontology from the given entities.
 */
export function generate(entities: SemanticModelEntity[]): Promise<string> {
    const generator = new Generator();
    return generator.generate(entities);
}

const RDF_TYPE = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

class Generator {
    private writer!: N3.Writer;
    private subclasses!: SemanticModelGeneralization[];
    private entitiesMap!: Record<string, SemanticModelEntity>;

    public generate(entities: SemanticModelEntity[]): Promise<string> {
        this.writer = new N3.Writer({prefixes: {
            owl: "http://www.w3.org/2002/07/owl#",
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        }});
        const classes = entities.filter(isSemanticModelClass);
        this.entitiesMap = Object.fromEntries(entities.map(e => [e.id, e]));
        this.subclasses = entities.filter(isSemanticModelGeneralization);
        this.subclasses.sort((a, b) => a.parent < b.parent ? -1 : a.parent > b.parent ? 1 : 0);
        classes.sort(simpleIdSort);
        const properties = entities.filter(isSemanticModelRelationship);

        for (const cls of classes) {
            this.writeClass(cls);
            const propertiesOfThisClass = properties.filter(p => p.ends[0]?.concept === cls.id);
            propertiesOfThisClass.sort(simpleIdSort);
            for (const property of propertiesOfThisClass) {
                this.writeProperty(property);
            }
        }

        return new Promise((resolve, reject) => this.writer.end((error, result) => resolve(result)));
    }

    private writeClass(entity: SemanticModelClass) {
        const iri = namedNode(entity.iri ?? entity.id);
        this.writer.addQuad(
            iri,
            RDF_TYPE,
            namedNode("http://www.w3.org/2002/07/owl#Class")
        );
        // Also rdfs class
        this.writer.addQuad(
            iri,
            RDF_TYPE,
            namedNode("http://www.w3.org/2000/01/rdf-schema#Class")
        );
        this.writeLanguageString(
            iri,
            namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
            entity.name
        );
        for (const subclass of this.subclasses.filter(s => s.child === entity.id)) {
            this.writer.addQuad(
                iri,
                namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf"),
                namedNode((this.entitiesMap[subclass.parent] as SemanticModelClass)?.iri ?? subclass.parent)
            );
        }
    }

    private getNodeById(id: string) {
        return namedNode(this.entitiesMap[id]?.iri ?? id);
    }

    private writeProperty(entity: SemanticModelRelationship) {
        const iri = namedNode(entity.iri ?? entity.id);
        this.writer.addQuad(
            iri,
            RDF_TYPE,
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property")
        );
        this.writer.addQuad(
            iri,
            RDF_TYPE,
            namedNode("http://www.w3.org/2002/07/owl#ObjectProperty")
        );
        this.writer.addQuad(
            iri,
            namedNode("http://www.w3.org/2000/01/rdf-schema#domain"),
            this.getNodeById(entity.ends[0]!.concept)
        );
        if (entity.ends[1]!.concept) {
            this.writer.addQuad(
                iri,
                namedNode("http://www.w3.org/2000/01/rdf-schema#range"),
                this.getNodeById(entity.ends[1]!.concept)
            );
        }
    }

    private writeLanguageString(subject: Quad_Subject, property: Quad_Predicate, languageString: LanguageString) {
        const languages = Object.keys(languageString);
        languages.sort();
        for (const lang of languages) {
            this.writer.addQuad(
                subject,
                property,
                literal(languageString[lang]!, lang),
            );
        }
    }
}
