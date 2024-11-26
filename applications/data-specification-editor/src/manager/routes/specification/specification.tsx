import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import {FC, useContext} from "react";
import {useSearchParams} from "react-router-dom";
import {DataSpecificationsContext} from "../../app";
import {DocumentationSpecification} from "./documentation-specification";
//import {ExternalSpecification} from "./external-specification";

/**
 * There could be more types of specifications. This component decides which
 * one to use.
 */
export const Specification: FC = () => {
    const [searchParams] = useSearchParams();
    const dataSpecificationIri = searchParams.get("dataSpecificationIri");

    const {dataSpecifications} = useContext(DataSpecificationsContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

    if (specification?.type === DataSpecification.TYPE_EXTERNAL) {
        //return <ExternalSpecification dataSpecificationIri={dataSpecificationIri as string} />;
    } else {
        return <DocumentationSpecification dataSpecificationIri={dataSpecificationIri as string} />;
    }
}
