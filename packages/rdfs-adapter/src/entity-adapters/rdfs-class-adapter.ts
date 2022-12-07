import {RdfObject, RdfSourceWrap} from "@dataspecer/core/core/adapter/rdf";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {IriProvider} from "@dataspecer/core/cim";
import {LanguageString} from "@dataspecer/core/core/core-resource";
import {loadRdfsEntityToResource} from "./rdfs-entity-adapter";
import {RDFS} from "../rdfs-vocabulary";


export async function isRdfsClass(entity: RdfSourceWrap): Promise<boolean> {
    return (await entity.types()).includes("http://www.w3.org/2000/01/rdf-schema#Class");
}

export async function loadRdfsClass(entity: RdfSourceWrap, idProvider: IriProvider): Promise<PimClass> {
    const resource = new PimClass();
    await loadRdfsEntityToResource(entity, idProvider, resource);

    resource.pimExtends = unique([
        ...resource.pimExtends,
        ...(await entity.nodes(RDFS.subClassOf)).map(idProvider.cimToPim),
    ]);

    return resource;
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}
