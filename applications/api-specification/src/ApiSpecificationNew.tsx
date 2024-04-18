import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SubmitHandler } from 'react-hook-form';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';


// Define the type for your form data
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
            oType: string,
            oName: string,
            oEndpoint: string,
            oComment: string
        }[]
        singleResOperation?:{
            oType: string,
            oName: string,
            oEndpoint: string,
            oComment: string
        }[]
    }[];
};

// Define form schema using zod
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
    // Create form instance using useForm
    const { register, handleSubmit, control } = useForm<FormValues>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });

    // State to track whether collection logic is enabled for each data structure
    const [collectionLogicEnabled, setCollectionLogicEnabled] = useState<boolean[]>([]);
    // State to track whether single resource logic is enabled for each data structure
    const [singleResourceLogicEnabled, setSingleResourceLogicEnabled] = useState<boolean[]>([]);

    // Function to handle form submission
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        // Validate form data against the schema
        try {
            formSchema.parse(data);
            // Logic to handle form submission
            console.log('Form submitted with data:', data);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Form validation failed:', error.message);
            } else {
                console.error('Form validation failed:', 'Unknown error occurred');
            }
        }
    };

    // Function to toggle collection logic for a specific data structure
    const toggleCollectionLogic = (index: number) => {
        setCollectionLogicEnabled(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    // Function to toggle single resource logic for a specific data structure
    const toggleSingleResourceLogic = (index: number) => {
        setSingleResourceLogicEnabled(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    return (
        <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Input fields for API Title, Description, Version, Base URL, and Data Specification */}
            <Card className="p-4">
                <div className="p-1 flex items-center">
                    <label htmlFor="apiTitle" className="mr-2">API Title: </label>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="apiTitle"
                            required
                            {...register('apiTitle')}
                        />
                    </div>
                </div>

                <div className="p-1 flex items-center">
                    <label htmlFor="apiDescription" className="mr-2">API Description: </label>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="apiDescription"
                            required
                            {...register('apiDescription')}
                        />
                    </div>
                </div>

                <div className="p-1 flex items-center">
                    <label htmlFor="apiVersion" className="mr-2">API Version: </label>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="apiVersion"
                            required
                            {...register('apiVersion')}
                        />
                    </div>
                </div>

                <div className="p-1 flex items-center">
                    <label htmlFor="baseUrl" className="mr-2">Base URL: </label>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="baseUrl"
                            required
                            {...register('baseUrl')}
                        />
                    </div>
                </div>

                <div className="p-1 flex items-center">
                    <label htmlFor="dataSpecification" className="mr-2">Data Specification: </label>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="dataSpecification"
                            required
                            {...register('dataSpecification')}
                        />
                    </div>
                </div>

            </Card>

            {/* Data Structures */}
            <Card className="p-4 mt-5">
                <h3>Data Structures:</h3>
                {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">

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
                            <input className="mr-0.5"
                                type="checkbox"
                                checked={collectionLogicEnabled[index]}
                                onChange={() => toggleCollectionLogic(index)}
                            />
                            <label className="mr-2">a Collection</label>
                            <input className="mr-0.5"
                                type="checkbox"
                                checked={singleResourceLogicEnabled[index]}
                                onChange={() => toggleSingleResourceLogic(index)}
                            />
                            <label>a Single Resource</label>
                        </div>

                        {/* Additional cards for collection and single resource logic */}
                        {collectionLogicEnabled[index] && (
                            <Card className="p-4 mt-5">


                                <div className="flex w-full p-1">
                                    <h4>Collection Operations:</h4>
                                </div>

                                {
                                    field?.collectionOperations?.map((colOp, operationIndex) => (
                                        <div key={operationIndex}>
                                            <Card className="p-2">

                                                <div className='flex w-full justify-between p-2'>
                                                    <div>
                                                        <h2>Operation ID: {operationIndex}</h2>
                                                    </div>

                                                    <div>
                                                        <Button className="bg-red-500 hover:bg-red-400"
                                                            type="button"
                                                            onClick={() => {
                                                                // Remove the operation from the collectionOperations array
                                                                const updatedOperations = (field.collectionOperations || []).filter((_, idx) => idx !== operationIndex);
                                                                update(index, { ...field, collectionOperations: updatedOperations });
                                                            }}>
                                                            Delete Operation
                                                        </Button>
                                                    </div>

                                                </div>
                                                <Card className="p-5">
                                                    <label htmlFor="operationType">Operation Type:</label>

                                                    <select id="operationType" {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oType` as const)} required>
                                                        <option value="">Select Operation Type</option>
                                                        <option value="GET">GET</option>
                                                        <option value="POST">POST</option>
                                                        <option value="PUT">PUT</option>
                                                        <option value="DELETE">DELETE</option>
                                                    </select>

                                                    <div className="p-1 flex items-center">
                                                        <label className="mr-2" htmlFor={`operationName_${index}_${operationIndex}`}>Operation Name:</label>
                                                        <Input
                                                            id={`operationName_${index}_${operationIndex}`}
                                                            placeholder="Enter Operation Name"
                                                            {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oName` as const)}
                                                        />
                                                    </div>
                                                    <div className="p-1 flex items-center">
                                                        <label htmlFor={`endpoint_${index}_${operationIndex}`}>Endpoint:</label>
                                                        <Input
                                                            id={`endpoint_${index}_${operationIndex}`}
                                                            placeholder="Enter Endpoint"
                                                            {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oEndpoint` as const)}
                                                        />
                                                    </div>
                                                    <div className="p-1 flex items-center">
                                                        <label htmlFor={`comment_${index}_${operationIndex}`}>Comment:</label>
                                                        <Input
                                                            id={`comment_${index}_${operationIndex}`}
                                                            placeholder="Enter Comment"
                                                            {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oComment` as const)}
                                                        />
                                                    </div>

                                                </Card>

                                            </Card>

                                        </div>
                                    ))
                                }
                                <Button className='bg-blue-500 hover:bg-blue-400' type="button" onClick={() => update(index, {
                                    ...field, collectionOperations: [...(field?.collectionOperations || []), {
                                        oType: "",
                                        oName: "",
                                        oEndpoint: "",
                                        oComment: ""
                                    }]
                                })}>Add Operation</Button>
                            </Card>
                        )}

                        {singleResourceLogicEnabled[index] && <Card className="p-4">Logic for Single Resource</Card>}
                    </Card>
                ))}
                <Button className='bg-blue-500 hover:bg-blue-400' type="button" onClick={() => append({ name: '', isCollection: false, isSingleResource: false })}>Add Data Structure</Button>
            </Card>

            <Button type="submit">Generate OpenAPI Specification</Button>
        </form>
    );
};

export default ApiSpecificationForm;
