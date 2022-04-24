import chalk from "chalk";
import {BackendConnector} from "@dataspecer/backend-utils/connectors/backend-connector";
import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {DataSpecificationWithMetadata} from "@dataspecer/backend-utils/interfaces/data-specification-with-metadata";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces/data-specification-with-stores";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores/http-synchronized-store";
import {ReadOnlyFederatedStore} from "@dataspecer/core/core/store/federated-store/read-only-federated-store";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-nodejs";
import {DefaultArtifactConfigurator} from "@dataspecer/core/data-specification/default-artifact-configurator";
import {createDefaultArtefactGenerators, Generator} from "@dataspecer/core/generator";
import {FileStreamDictionary} from "../shared/file-stream-dictionary";

type GenerateArguments = {
    dataSpecificationIri: string;
    backendUrl: string;
}

export async function generate(argv: GenerateArguments) {
    const {dataSpecificationIri, backendUrl} = argv;

    const backendConnector = new BackendConnector(backendUrl, httpFetch);

    const dataSpecificationIrisToLoad = [dataSpecificationIri];
    const dataSpecifications: { [iri: string]: DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores } = {};

    console.log("loading data specifications");

    for (let i = 0; i < dataSpecificationIrisToLoad.length; i++) {
        const dataSpecificationIri = dataSpecificationIrisToLoad[i];
        const dataSpecification = await backendConnector.readDataSpecification(dataSpecificationIri);
        if (dataSpecification) {
            dataSpecifications[dataSpecificationIri] = dataSpecification;
            dataSpecification.importsDataSpecifications.forEach(importIri => {
                if (!dataSpecificationIrisToLoad.includes(importIri)) {
                    dataSpecificationIrisToLoad.push(importIri);
                }
            });
        }
    }

    // Gather all store descriptors
    const storeDescriptors: StoreDescriptor[] = [];
    for (const dataSpecification of Object.values(dataSpecifications)) {
        storeDescriptors.push(...dataSpecification.pimStores);
        Object.values(dataSpecification.psmStores).forEach(psm => {
            storeDescriptors.push(...psm);
        });
    }

    console.log("loading stores\r");

    const stores: CoreResourceReader[] = [];
    for (const storeDescriptor of storeDescriptors) {
        const store = HttpSynchronizedStore.createFromDescriptor(storeDescriptor, httpFetch);
        await store.load();
        stores.push(store);
    }

    const store = ReadOnlyFederatedStore.createLazy(stores);

    const dataSpecificationsArr = Object.values(dataSpecifications);
    const artifactConfigurator = new DefaultArtifactConfigurator(dataSpecificationsArr, store);
    dataSpecifications[dataSpecificationIri].artefacts = await artifactConfigurator.generateFor(dataSpecificationIri);

    const generator = new Generator(
        dataSpecificationsArr,
        store,
        createDefaultArtefactGenerators(),
    );

    console.log(`generating artifacts`);

    const fileStreamDictionary = new FileStreamDictionary();
    await generator.generate(dataSpecificationIri, fileStreamDictionary);

    console.log("dataspecer generated artifacts " + chalk.green.bold("successfully"));
}
