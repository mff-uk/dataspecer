import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SubmitHandler } from 'react-hook-form';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import OperationTypeSelect from './customComponents/OperationTypeSelect';
import OperationNameInput from './customComponents/OperationNameInput';
import EndpointInput from './customComponents/EndpointInput';
import CommentInput from './customComponents/CommentInput';
import LabeledInput from './customComponents/LabeledInput';
import FormCardSection from './customComponents/FormCardSection';
import useSWR from 'swr'
import CustomCheckbox from './customComponents/CustomCheckbox';

// form obj
type FormValues = {
    apiTitle: string;
    apiDescription: string;
    apiVersion: string;
    baseUrl: string;
    dataSpecification: string;
    dataStructures: {
        id?: string;
        name: string;
        isCollection: boolean;
        isSingleResource: boolean;
        collectionOperations?: {
            oType: string;
            oName: string;
            oEndpoint: string;
            oComment: string;
        }[];
        singleResOperation?: {
            oType: string;
            oName: string;
            oEndpoint: string;
            oComment: string;
        }[];
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

const fetcher: (...args: Parameters<typeof fetch>) => Promise<any> = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(res => res.json());

const ffetcher: (...args: Parameters<typeof fetch>) => Promise<any> = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(res => res.json());


export const ApiSpecificationForm = () => {

    {/* call swr hook to get info about data specification*/}
    const {data, error} = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher)
    
    // // get Data Structure iris
    const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) => resource.types.includes("http://dataspecer.com/resources/v1/psm"))
    .map((resource: { iri: any; }) => resource.iri);

    
    let dataStructures: any[] = [];

    //iterate over data structure iris and fetch individual data structure infos 
    //TODO: change to async 
    // if (Array.isArray(dsIris)) {
    //     for (let i = 0; i < dsIris.length; i++) {
    //         const iri: string = dsIris[i];
    //         const { data, error } = useSWR("https://backend.dataspecer.com/resources/blob?iri=" + iri, ffetcher);
            
    //         if (!error && data) {
    //             dataStructures.push(data);
    //         }
    //     }
    // }

    if (Array.isArray(dsIris)) {
        // Map each iri to a promise that fetches the data
        const fetchPromises = dsIris.map(iri =>
            fetch("https://backend.dataspecer.com/resources/blob?iri=" + iri)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching data for ${iri}:`, error);
                    return null; // Or handle the error according to your needs
                })
        );
    
        // Wait for all promises to resolve
        Promise.all(fetchPromises)
            .then(dataArray => {
                // Filter out any null values (errors occurred during fetching)
                const validData = dataArray.filter(data => data !== null);
                // Push valid data to your data structures
                dataStructures.push(...validData);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                // Handle error
            });
    }
    
    // at this point dataStructures is populated with individual data structure info
    // TODO: populate selects with correct values

    const { register, handleSubmit, control } = useForm<FormValues>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });

    // States  for tracking whether collection/single resource mode is activated for each Data Structure
    const [collectionLogicEnabled, setCollectionLogicEnabled] = useState<boolean[]>([]);
    const [singleResourceLogicEnabled, setSingleResourceLogicEnabled] = useState<boolean[]>([]);

    // Handles submission of the form
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        try {
            formSchema.parse(data);
            // TODO: Add Logic to handle form submission
            console.log('Form submitted with data:', data);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Form validation failed:', error.message);
            } else {
                console.error('Form validation failed:', 'Unknown error occurred');
            }
        }
    };

    // TODO: Move these to helper function file 
    
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
            oType: "",
            oName: "",
            oEndpoint: "",
            oComment: ""
        }];
        update(index, { ...fields[index], collectionOperations: updatedOperations });
    };

    // Handles removing an operation from the collection for a particular DS
    // TODO: update operation structure
    const removeOperation = (index: number, operationIndex: number) => {
        const updatedOperations = fields[index]?.collectionOperations?.filter((_, idx) => idx !== operationIndex);
        update(index, { ...fields[index], collectionOperations: updatedOperations });
    };

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
                                <select {...register(`dataStructures.${index}.name` as const)} required>
                                    <option value="Structure 1">Structure 1</option>
                                    <option value="Structure 2">Structure 2</option>
                                    {/* Add more options as needed */}
                                </select>
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
                                    <div key={operationIndex}>
                                        <Card className="p-2">
                                            {/* Operation ID and Delete button */}
                                            <div className='flex w-full justify-between p-2'>
                                                <div>
                                                    <h2>Operation ID: {operationIndex}</h2>
                                                </div>
                                                <div>
                                                    <Button
                                                        className="bg-red-500 hover:bg-red-400"
                                                        type="button"
                                                        onClick={() => removeOperation(index, operationIndex)}
                                                    >
                                                        Delete Operation
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Form fields for operation details */}
                                            <Card className="p-5">
                                                {/* Operation Type */}
                                                <OperationTypeSelect
                                                    index={index}
                                                    operationIndex={operationIndex}
                                                    register={register}
                                                    collectionLogicEnabled={false} 
                                                    singleResourceLogicEnabled={false}  
                                                />
                                                {/* Operation Name */}
                                                <OperationNameInput
                                                    index={index}
                                                    operationIndex={operationIndex}
                                                    register={register} 
                                                    collectionLogicEnabled={false} 
                                                    singleResourceLogicEnabled={false}                                                />
                                                {/* Endpoint */}
                                                <EndpointInput index={index} operationIndex={operationIndex} register={register} collectionLogicEnabled={false} singleResourceLogicEnabled={false} />
                                                {/* Comment */}
                                                <CommentInput index={index} operationIndex={operationIndex} register={register} collectionLogicEnabled={false} singleResourceLogicEnabled={false} />

                                            </Card>
                                        </Card>
                                    </div>
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

                        {singleResourceLogicEnabled[index] && <FormCardSection>Logic for Single Resource</FormCardSection>}
                    </FormCardSection>
                ))}
                <Button className='bg-blue-500 hover:bg-blue-400' type="button" onClick={() => append({ name: '', isCollection: false, isSingleResource: false })}>Add Data Structure</Button>
            </FormCardSection>

            <Button type="submit">Generate OpenAPI Specification</Button>
        </form>
    );
};

export default ApiSpecificationForm;
