import express from "express";
import {dataSpecificationModel, replaceStoreDescriptorsInDataSpecification} from "../main";
import {SchemaGeneratorConfiguration} from "@model-driven-data/backend-utils/interfaces/schema-generator-configuration";
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {DataSpecificationWithMetadata} from "@model-driven-data/backend-utils/interfaces/data-specification-with-metadata";
import {DataSpecificationWithStores} from "@model-driven-data/backend-utils/interfaces/data-specification-with-stores";
import {asyncHandler} from "../utils/async-handler";

export const configurationByDataPsm = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataPsmSchemaIri = String(request.query.dataPsmSchemaIri);
    const dataSpecifications = await dataSpecificationModel.getAllDataSpecifications();
    const dataSpecificationIri = dataSpecifications.find(dataSpecification => dataSpecification.psms.includes(dataPsmSchemaIri))?.iri;

    if (!dataSpecificationIri) {
        response.status(404).send();
        return;
    }

    const findDataSpecification = (iri: string) => dataSpecifications.find(dataSpecification => dataSpecification.iri === iri);

    const dataSpecificationsToInclude = [dataSpecificationIri];

    for (let i = 0; i < dataSpecificationsToInclude.length; i++) {
        const dataSpecification = findDataSpecification(dataSpecificationsToInclude[i]);
        if (dataSpecification) {
            dataSpecification.importsDataSpecifications.map(spec => {
                if (!dataSpecificationsToInclude.includes(spec)) {
                    dataSpecificationsToInclude.push(spec);
                }
            });
        }
    }

    const filteredDataSpecifications = dataSpecificationsToInclude.map(iri =>
      findDataSpecification(iri))
      .filter(dataSpecification => dataSpecification) as (
      DataSpecification & DataSpecificationWithMetadata &
      DataSpecificationWithStores)[];

    const data: SchemaGeneratorConfiguration = {
        dataSpecification: dataSpecificationIri,
        dataPsmSchemaIri,
        dataSpecifications: filteredDataSpecifications.map(replaceStoreDescriptorsInDataSpecification)
    }
    response.send(data);
});
