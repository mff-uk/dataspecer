import React, { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './components/ui/button';
import { generateOpenAPISpecification } from './OpenAPIGenerator';
import { useDataSpecificationInfo } from './DataStructureFetcher';
import OperationCard from './customComponents/OperationCard';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./components/ui/form.tsx";
import { Input } from "./components/ui/input.tsx";
import { Card } from "./components/ui/card.tsx";
import { DevTool } from "@hookform/devtools"
import { v4 as uuidv4 } from 'uuid';

type Operation = {
    oName: string;
    oAssociationMode?: boolean;
    oIsCollection: boolean;
    oType: string;
    oEndpoint: string;
    oComment: string;
    oResponse: string;
    oRequestBody: {
        [key: string]: string;
    };
    oTargetObject?: DataStructure
};

type FormValues = {
    apiTitle: string;
    apiDescription: string;
    apiVersion: string;
    baseUrl: string;
    dataSpecification?: string;
    dataStructures: {
        id?: string;
        name: string;
        operations: Operation[];
    }[];
};


export const ApiSpecificationForm = () => {

    const form = useForm();
    const { register, control } = form;

    /* Keep As it Is  START */

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

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });


    /* Keep As it is - END */


    // const onSubmit: SubmitHandler<FormValues> = (data) => {
    //     try {
    //         const openAPISpec = generateOpenAPISpecification(fetchedDataStructuresArr, data);
    //         console.log("submitted data: " + JSON.stringify(data))
    //         console.log('Generated OpenAPI Specification:', openAPISpec);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             console.error('Form validation failed:', error.message);
    //         } else {
    //             console.error('Form validation failed:', 'Unknown error occurred');
    //         }
    //     }
    // };

    // const addOperation = (index: number) => {
    //     const newOperation = {
    //         name: '',
    //         isCollection: false,
    //         oType: '',
    //         oName: '',
    //         oEndpoint: '',
    //         oComment: '',
    //         oResponse: '',
    //         oRequestBody: {},
    //         //oResponseObject: {}
    //     };

    //     update(index, {
    //         ...fields[index],
    //         operations: [...fields[index].operations, newOperation],
    //     });

    //     setSelectedDataStructures((prevState) => {
    //         const newState = [...prevState];
    //         newState[index] = { ...newState[index], operations: newOperation };
    //         return newState;
    //     });
    // };

    // // Function to remove an operation from a data structure
    // const removeOperation = (dataStructureIndex: number, operationIndex: number) => {
    //     const updatedOperations = fields[dataStructureIndex].operations.filter((_, idx) => idx !== operationIndex);

    //     update(dataStructureIndex, {
    //         ...fields[dataStructureIndex],
    //         operations: updatedOperations,
    //     });

    //     setSelectedDataStructures((prevState) => {
    //         const newState = [...prevState];
    //         newState[dataStructureIndex].operations = updatedOperations;
    //         return newState;
    //     });
    // };

    return (
        <Form {...form}>
            <Card>
                <FormField
                    control={form.control}
                    name="apiTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Write your API Title here" {...field} />
                            </FormControl>
                            {/*<FormDescription>This is your public display name.</FormDescription>*/}
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="apiDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Write your API Description here" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="apiVersion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Version</FormLabel>
                            <FormControl>
                                <Input placeholder="Write your API Version here" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="apiBaseUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Base URL</FormLabel>
                            <FormControl>
                                <Input placeholder="Write base url for your API here" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </Card>

            <Card>
                <h3>Data Structures</h3>
                <Card>
                    <div>
                        {
                            // Here we have access to each field - datastructure 
                            fields.map((field, index) => {
                                return (
                                    <FormControl key={field.id}>
                                        <div>
                                            {/* Added missing div closing tag */}
                                            <Card {...register(`dataStructures.${index}` as const)} />
                                            <h3>dfjsf</h3>
                                            {
                                                index > 0 && (
                                                    <Button onClick={() => remove(index)}>Remove DataStructure</Button>
                                                )
                                            }
                                        </div>
                                    </FormControl>
                                );
                            })
                        }
                        <Button onClick={() => append({ name: '', operations: [] })}>Add DataStructure</Button>
                    </div>

                </Card>
            </Card>
            <DevTool control={control} />
        </Form >
    );
};
