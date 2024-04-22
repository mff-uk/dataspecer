import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SubmitHandler } from 'react-hook-form';
import { Button } from './components/ui/button';
import LabeledInput from './customComponents/LabeledInput';
import FormCardSection from './customComponents/FormCardSection';
import useSWR from 'swr'
import CustomCheckbox from './customComponents/CustomCheckbox';
import OperationCard from './customComponents/OperationCard';
import { useDataSpecificationInfo } from './Fetcher';
import DataStructuresSelect from './customComponents/DataStructSelect';
import { v4 as uuidv4 } from 'uuid';
import { generateOpenAPISpecification } from './OpenAPIGenerator';



interface Operation {
    collection: boolean;
    oType: string;
    oName: string;
    oEndpoint: string;
    oComment: string;
    oResponse: string;
}

type FormValues = {
    apiTitle: string;
    apiDescription: string;
    apiVersion: string;
    baseUrl: string;
    dataSpecification: string;
    dataStructures: {
        id?: string;
        name: string;
        givenName?: string
        isCollection?: boolean;
        isSingleResource?: boolean;
        collectionOperations?: Operation[];
        singleResOperation?: Operation[];
    }[];
};

// validation via zod
const formSchema = z.object({
    apiTitle: z.string().min(1),
    apiDescription: z.string().min(1),
    apiVersion: z.string().min(1),
    baseUrl: z.string().min(1),
    dataSpecification: z.string().min(1),
    dataStructures: z.array(
        z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            isCollection: z.boolean(),
            isSingleResource: z.boolean(),
            collectionOperations: z.array(
                z.object({
                    oType: z.string().optional(),
                    oName: z.string().optional(),
                    oEndpoint: z.string().optional(),
                    oComment: z.string().optional(),
                }).optional()
            ).optional()
        })
    ),
});



export const ApiSpecificationForm = () => {

    const { register, handleSubmit, control, watch } = useForm<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });


    const [selectedDataStructures, setSelectedDataStructures] = useState<Array<any>>([]); // Track selected data structures

    useEffect(() => {
        const dataStructures = watch("dataStructures");
    
        setSelectedDataStructures(dataStructures);
    }, [watch]);

    /* Handle Changes with respect to BaseUrl */
    const baseUrl = watch("baseUrl");


    const handleBaseUrlChange = useCallback((newBaseUrl) => {
        console.log(`baseUrl changed to: ${newBaseUrl}`);
    }, []);

    useEffect(() => {
        handleBaseUrlChange(baseUrl);
    }, [baseUrl, handleBaseUrlChange]);

    // States  for tracking whether collection/single resource mode is activated for each Data Structure
    const [collectionLogicEnabled, setCollectionLogicEnabled] = useState<boolean[]>([]);
    const [singleResourceLogicEnabled, setSingleResourceLogicEnabled] = useState<boolean[]>([]);

    // Handles submission of the form
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        try {
            formSchema.parse(data);
            // TODO: Add Logic to handle form submission
            //console.log('Form submitted with data:', data);

            const openAPISpec = generateOpenAPISpecification(fetchedDataStructuresArr, data);
            console.log('Generated OpenAPI Specification:', openAPISpec)
        } catch (error) {
            if (error instanceof Error) {
                console.error('Form validation failed:', error.message);
            } else {
                console.error('Form validation failed:', 'Unknown error occurred');
            }
        }
    };

    // Handles toggle collection logic for particular DS
    const toggleCollectionLogic = (index: number) => {
        setCollectionLogicEnabled(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    // Handles to toggle single resource logic for particular DS
    const toggleSingleResourceLogic = (index: number) => {
        setSingleResourceLogicEnabled(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    // Handles adding a new operation to the collection for a particular DS
    // TODO: update operation structure
    const addOperation = (index: number) => {
        const updatedOperations = [...(fields[index].collectionOperations || []), {
            collection: true,
            oType: "",
            oName: "",
            oEndpoint: "",
            oComment: "",
            oResponse: ""
        }];
        update(index, { ...fields[index], collectionOperations: updatedOperations });

        setSelectedDataStructures((prevState) => {
            const newState = [...prevState];
            newState[index] = { ...newState[index], collectionOperations: updatedOperations };
            return newState;
        });
    };

    const addOperationSingle = (index: number) => {
        const updatedOperations = [...(fields[index].singleResOperation || []), {
            collection: false,
            oType: "",
            oName: "",
            oEndpoint: "",
            oComment: "",
            oResponse: ""

        }];

        setSelectedDataStructures((prevState) => {
            const newState = [...prevState];
            newState[index] = { ...newState[index], singleResOperation: updatedOperations };
            return newState;
        });
        update(index, { ...fields[index], singleResOperation: updatedOperations });

    };


    // Handles removing an operation from the collection for a particular DS
    const removeOperation = (index: number, operationIndex: number) => {
        const updatedOperations = fields[index]?.collectionOperations?.filter((_, idx) => idx !== operationIndex);
        update(index, { ...fields[index], collectionOperations: updatedOperations });
    };

    const removeOperationSingle = (index: number, operationIndex: number) => {
        const updatedOperations = fields[index]?.singleResOperation?.filter((_, idx) => idx !== operationIndex);
        update(index, { ...fields[index], singleResOperation: updatedOperations });
    };

    // Initialize fetched data structures array
    const [fetchedDataStructuresArr, setFetchedDataStructuresArr] = useState([]);

    // Get data structures fetching function from custom hook
    const { fetchDataStructures } = useDataSpecificationInfo();

    // Use useEffect to fetch data structures when component mounts
    useEffect(() => {
        // Fetch data only if fetchDataStructures is defined
        if (!fetchDataStructures) {
            console.error('fetchDataStructures is not defined or not callable');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch data structures
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

    return (

        <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
            {/* OpenAPI: Info */}
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
                                            register(`dataStructures.${index}.name`).onChange({
                                                target: {
                                                    value: selectedDataStructure.name
                                                },
                                            });

                                            setSelectedDataStructures((prevState) => {
                                                const newState = [...prevState];
                                                newState[index] = selectedDataStructure;
                                                return newState;
                                            });

                                            update(index, { ...fields[index], name: selectedDataStructure.name, id: selectedDataStructure.id });
                                        
                                    }
                                    }

                                />
                            </div>

                            <div><Button className="bg-red-500 hover:bg-red-400" type="button" onClick={() => remove(index)}>Delete</Button></div>

                        </div>
                        <div>
                            <label className="mr-2">Treat the resource as a </label>
                            <CustomCheckbox
                                label="a Collection"
                                checked={collectionLogicEnabled[index]}
                                onChange={() => toggleCollectionLogic(index)}
                            />
                            <CustomCheckbox
                                label="a Single Resource"
                                checked={singleResourceLogicEnabled[index]}
                                onChange={() => toggleSingleResourceLogic(index)}
                            />
                        </div>

                        {/* Additional cards for collection and single resource logic */}
                        {collectionLogicEnabled[index] && (
                            <FormCardSection>
                                <div className="flex w-full p-1">
                                    <h4>Collection Operations:</h4>
                                </div>
                                {/* Render collection operations */}
                                {field?.collectionOperations?.map((colOp, operationIndex) => (
                                    <OperationCard
                                        key={operationIndex}
                                        operationIndex={operationIndex}
                                        removeOperation={removeOperation}
                                        index={index}
                                        register={register}
                                        collectionLogicEnabled={collectionLogicEnabled[index]}
                                        singleResourceLogicEnabled={singleResourceLogicEnabled[index]}
                                        baseUrl={baseUrl}
                                        selectedDataStructure={selectedDataStructures[index].name} 
                                        fetchedDataStructures={fetchedDataStructuresArr} />
                                ))}
                                {/* Button to add new operation */}
                                <Button
                                    className='bg-blue-500 hover:bg-blue-400'
                                    type="button"
                                    onClick={() => addOperation(index)}
                                >
                                    Add Operation
                                </Button>
                            </FormCardSection>
                        )}

                        {singleResourceLogicEnabled[index] && (
                            <FormCardSection>
                                <div className="flex w-full p-1">
                                    <h4>Single Operations:</h4>
                                </div>
                                {/* Render collection operations */}
                                {field?.singleResOperation?.map((singleOp, operationIndex) => (
                                    <OperationCard
                                        key={operationIndex}
                                        operationIndex={operationIndex}
                                        removeOperation={removeOperationSingle}
                                        index={index}
                                        register={register}
                                        collectionLogicEnabled={collectionLogicEnabled[index]}
                                        singleResourceLogicEnabled={singleResourceLogicEnabled[index]}
                                        baseUrl={baseUrl}
                                        selectedDataStructure={selectedDataStructures[index].name}
                                        fetchedDataStructures={fetchedDataStructuresArr}
                                    />
                                ))}
                                {/* Button to add new operation */}
                                <Button
                                    className='bg-blue-500 hover:bg-blue-400'
                                    type="button"
                                    onClick={() => addOperationSingle(index)}
                                >
                                    Add Operation
                                </Button>
                            </FormCardSection>
                        )}
                    </FormCardSection>
                ))}
                <Button className='bg-blue-500 hover:bg-blue-400' type="button" onClick={() => append({ name: '', isCollection: false, isSingleResource: false })}>Add Data Structure</Button>
            </FormCardSection>

            <Button type="submit">Generate OpenAPI Specification</Button>
        </form>
    );
};