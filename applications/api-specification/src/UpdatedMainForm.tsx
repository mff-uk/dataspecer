import React, { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './components/ui/button';
import LabeledInput from './customComponents/LabeledInput';
import FormCardSection from './customComponents/FormCardSection';
import CustomCheckbox from './customComponents/CustomCheckbox';
import DataStructuresSelect from './customComponents/DataStructSelect';
import { generateOpenAPISpecification } from './OpenAPIGenerator';
import { useDataSpecificationInfo } from './Fetcher';
import OperationCard from './customComponents/OperationCard';

type Operation = {
    name: string;
    isCollection: boolean;
    oType: string;
    oName: string;
    oEndpoint: string;
    oComment: string;
    oResponse: string;
    oRequestBody: {
        [key: string]: string;
    };
    oResponseObject?: DataStructure
};

type FormValues = {
    apiTitle: string;
    apiDescription: string;
    apiVersion: string;
    baseUrl: string;
    dataSpecification: string;
    dataStructures: {
        id?: string;
        name: string;
        operations: Operation[];
    }[];
};

// Validation schema using zod
// const formSchema = z.object({
//     apiTitle: z.string().min(1),
//     apiDescription: z.string().min(1),
//     apiVersion: z.string().min(1),
//     baseUrl: z.string().min(1),
//     dataSpecification: z.string().min(1),
//     dataStructures: z.array(
//         z.object({
//             id: z.string().optional(),
//             name: z.string().min(1),
//             operations: z.array(
//                 z.object({
//                     name: z.string().min(1),
//                     isCollection: z.boolean(),
//                     // Add validation for other operation properties
//                     oType: z.string(),
//                     oName: z.string(),
//                     oEndpoint: z.string(),
//                     oComment: z.string(),
//                     oResponse: z.string(),
//                 })
//             ),
//         })
//     ),
// });

export const ApiSpecificationForm = () => {
    const { register, handleSubmit, control, watch } = useForm<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });

    const baseUrl = watch("baseUrl");


    const handleBaseUrlChange = useCallback((newBaseUrl) => {
        console.log(`baseUrl changed to: ${newBaseUrl}`);
    }, []);

    useEffect(() => {
        handleBaseUrlChange(baseUrl);
    }, [baseUrl, handleBaseUrlChange]);

    const [selectedDataStructures, setSelectedDataStructures] = useState<Array<any>>([]);

    useEffect(() => {
        const dataStructures = watch("dataStructures");
        setSelectedDataStructures(dataStructures);
    }, [watch]);

    const [fetchedDataStructuresArr, setFetchedDataStructuresArr] = useState([]);

    const { fetchDataStructures } = useDataSpecificationInfo();

    useEffect(() => {
        if (!fetchDataStructures) {
            console.error('fetchDataStructures is not defined or not callable');
            return;
        }

        const fetchData = async () => {
            try {
                const data = await fetchDataStructures();
                if (!data) {
                    console.log('No data structures found.');
                    return;
                }

                setFetchedDataStructuresArr(data);
            } catch (err) {
                console.error('Error fetching data structures:', err);
            }
        };

        fetchData();
    }, [fetchDataStructures]);

    console.log(fetchedDataStructuresArr);


    const onSubmit: SubmitHandler<FormValues> = (data) => {
        try {
            const openAPISpec = generateOpenAPISpecification(fetchedDataStructuresArr, data);
            console.log("submitted data: " + data)
            console.log('Generated OpenAPI Specification:', openAPISpec);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Form validation failed:', error.message);
            } else {
                console.error('Form validation failed:', 'Unknown error occurred');
            }
        }
    };

    const addOperation = (index: number) => {
        const newOperation = {
            name: '',
            isCollection: false,
            oType: '',
            oName: '',
            oEndpoint: '',
            oComment: '',
            oResponse: '',
            oRequestBody: {},
            //oResponseObject: {}
        };

        update(index, {
            ...fields[index],
            operations: [...fields[index].operations, newOperation],
        });

        setSelectedDataStructures((prevState) => {
            const newState = [...prevState];
            newState[index] = { ...newState[index], operations: newOperation };
            return newState;
        });
    };

    // Function to remove an operation from a data structure
    const removeOperation = (dataStructureIndex: number, operationIndex: number) => {
        const updatedOperations = fields[dataStructureIndex].operations.filter((_, idx) => idx !== operationIndex);

        update(dataStructureIndex, {
            ...fields[dataStructureIndex],
            operations: updatedOperations,
        });

        setSelectedDataStructures((prevState) => {
            const newState = [...prevState];
            newState[dataStructureIndex].operations = updatedOperations;
            return newState;
        });
    };

    return (
        <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Form Info */}
            <FormCardSection>
                <LabeledInput label="API Title" id="apiTitle" register={register} required />
                <LabeledInput label="API Description" id="apiDescription" register={register} required />
                <LabeledInput label="API Version" id="apiVersion" register={register} required />
                <LabeledInput label="Base URL" id="baseUrl" register={register} required />
                <LabeledInput label="Data Specification" id="dataSpecification" register={register} required />
            </FormCardSection>

            {/* Data Structures */}
            <FormCardSection>
                <h3>Data Structures:</h3>
                {fields.map((field, index) => (
                    <FormCardSection key={field.id}>
                        <div className="flex flex-row justify-between">
                            <div>
                                <label>Choose Data Structure:</label>
                                <DataStructuresSelect
                                    key={`dataStructureSelect_${index}`}
                                    index={index}
                                    register={register}
                                    dataStructures={fetchedDataStructuresArr}
                                    onChange={(selectedDataStructure) => {
                                        console.log("here I am " + JSON.stringify(selectedDataStructure))
                                        register(`dataStructures.${index}.name`).onChange({
                                            target: {
                                                value: selectedDataStructure.name,
                                            },
                                        });

                                        setSelectedDataStructures((prevState) => {
                                            const newState = [...prevState];
                                            newState[index] = selectedDataStructure;
                                            return newState;
                                        });

                                        update(index, {
                                            ...fields[index],
                                            name: selectedDataStructure.givenName,
                                            id: selectedDataStructure.id,
                                        });
                                    }}
                                />
                            </div>
                            <Button className="bg-red-500 hover:bg-red-400" type="button" onClick={() => remove(index)}>
                                Delete
                            </Button>
                        </div>

                        {/* Operations */}
                        <FormCardSection>
                            <h4>Operations:</h4>
                            {field.operations.map((op, opIndex) => (
                                <OperationCard
                                    key={opIndex}
                                    operationIndex={opIndex}
                                    removeOperation={removeOperation}
                                    index={index}
                                    register={register}
                                    collectionLogicEnabled={false}
                                    singleResourceLogicEnabled={false}
                                    baseUrl={baseUrl}
                                    selectedDataStructure={selectedDataStructures[index].givenName}
                                    fetchedDataStructures = {fetchedDataStructuresArr} /> 
                            ))}

                            {/* Add operation button */}
                            <Button
                                className="bg-blue-500 hover:bg-blue-400"
                                type="button"
                                onClick={() => addOperation(index)}
                            >
                                Add Operation
                            </Button>
                        </FormCardSection>
                    </FormCardSection>
                ))}
                <Button
                    className="bg-blue-500 hover:bg-blue-400"
                    type="button"
                    onClick={() => append({ name: '', operations: [] })}
                >
                    Add Data Structure
                </Button>
            </FormCardSection>

            {/* Submit Button */}
            <Button type="submit">Generate OpenAPI Specification</Button>
        </form>
    );
};
