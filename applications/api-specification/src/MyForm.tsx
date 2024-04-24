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
import { Switch } from "./components/ui/switch.tsx";
import { DevTool } from "@hookform/devtools"
import { v4 as uuidv4 } from 'uuid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Operation = {
    oId: string
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
        givenName?: string;
        operations: Operation[];
    }[];
};


export const ApiSpecificationForm = () => {

    const form = useForm();
    const { register, control, watch, setValue, handleSubmit } = form;

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

    //console.log(fetchedDataStructuresArr);

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });


    const handleDataStructureChange = (value, index) => {
        console.log("handleChange called with value:", value, "and index:", index);
        const selectedDataStructure = fetchedDataStructuresArr.find(
            (structure) => structure.name === value
        );

        if (selectedDataStructure) {
            console.log("Selected data structure:", selectedDataStructure);

            console.log("before setValue " + JSON.stringify(`dataStructures.${index}`));
            setValue(`dataStructures.${index}.name`, selectedDataStructure.name);
            setValue(`dataStructures.${index}.id`, selectedDataStructure.id);
            setValue(`dataStructures.${index}.givenName`, selectedDataStructure.givenName);



            console.log("before set " + JSON.stringify(`dataStructures.${index}`));


            setSelectedDataStructures((prevState) => {
                const newState = [...prevState];

                // Initialize prevState[index] if it doesn't exist
                if (!prevState[index]) {
                    prevState[index] = {
                        id: '',
                        name: '',
                        givenName: '',
                        operations: [],
                    };
                }

                // Ensure operations is an array
                if (!Array.isArray(prevState[index].operations)) {
                    prevState[index].operations = [];
                }

                // Update newState[index] with the selected data structure
                newState[index] = {
                    ...prevState[index],
                    id: selectedDataStructure.id,
                    name: selectedDataStructure.name,
                    givenName: selectedDataStructure.givenName,
                    // Keep existing operations (if any) or initialize as an empty array
                    operations: Array.isArray(prevState[index].operations) ? prevState[index].operations : [],
                };

                return newState;
            });




        } else {
            console.error('Selected data structure not found');
        }
    };

    const handleIsCollectionChecked = (value, index, operationIndex) => {
        setValue(`dataStructures.${index}.operations.${operationIndex}.oIsCollection`, value);
    }

    const handleAssociationModeChecked = (value, index, operationIndex) => {
        setValue(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`, value);
    }


    const [selectedDataStructures, setSelectedDataStructures] = useState<Array<any>>([]);

    useEffect(() => {
        const dataStructures = watch("dataStructures");
        console.log("BEFORE " + JSON.stringify(dataStructures))
        setSelectedDataStructures(dataStructures);
        console.log("AFTER " + JSON.stringify(dataStructures))
    }, [watch]);

    const addOperation = (index: number) => {
        const newOperation = {
            OId: uuidv4(),
            OName: '',
            oAssociationMode: false,
            oIsCollection: false,
            oType: '',
            oEndpoint: '',
            oComment: '',
            oResponse: '',
            oRequestBody: {},
            oTargetObject: {}
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

    /* Keep As it is - END */

    return (
        <Form {...form} >
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

            <Card className="p-2">
                <h3>Data Structures</h3>
                <div>
                    {
                        // Here we have access to each field - datastructure 
                        fields.map((field, index) => {
                            return (
                                <FormControl key={field.id}>
                                    <Card className="p-4 mt-5">
                                        {/* Logic for DataStructure Selection */}
                                        {
                                            index >= 0 && (
                                                <Button onClick={() => remove(index)}>Remove DataStructure</Button>
                                            )
                                        }
                                        {/* <Select
                                            onValueChange={(value) => handleDataStructureChange(value, index)}
                                            required
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a data structure" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fetchedDataStructuresArr.map((dataStructure) => (
                                                    <SelectItem control={form.control} key={dataStructure.id} value={dataStructure.name}>
                                                        {dataStructure.givenName} 
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select> */}

                                        <DataStructuresSelect
                                            key={`dataStructureSelect_${index}`}
                                            index={index}
                                            register={register}
                                            dataStructures={fetchedDataStructuresArr}
                                            isResponseObj={false}
                                            onChange={(selectedDataStructure.name) => {
                                                register(`dataStructures.${index}.name`).onChange({
                                                    target: {
                                                        value: selectedDataStructure.name,
                                                    },
                                                });

                                                setSelectedDataStructures((prevState) => {
                                                    const newState = [...prevState];
                                                    console.log(selectedDataStructure)
                                                    newState[index] = selectedDataStructure;
                                                    return newState;
                                                });

                                                update(index, {
                                                    ...fields[index],
                                                    name: selectedDataStructure.givenName,
                                                    id: selectedDataStructure.id,
                                                });
                                            }} operationIndex={undefined} />

                                        {/* Logic for OperationCard*/}
                                        <FormControl >
                                            <div>
                                                <h4>Operations:</h4>
                                                {

                                                    // Here we have access to operations of datastructure
                                                    Array.isArray(field.operations) && field.operations.map((op, operationIndex) => {
                                                        return (
                                                            <FormControl>
                                                                <div>
                                                                    {
                                                                        index >= 0 && (
                                                                            //...fields[index].operations[operationIndex]
                                                                            // <Button onClick={() => update(index,
                                                                            //     {
                                                                            //         ...fields[index],
                                                                            //         operations: fields[index]?.operations?.filter((_, idx) => idx !== operationIndex)
                                                                            //     })}>Remove Operation</Button>

                                                                            <Button
                                                                                className="bg-red-500 hover:bg-red-400"
                                                                                type="button"
                                                                                onClick={() => removeOperation(index, operationIndex)}
                                                                            >Remove Operation</Button>
                                                                        )
                                                                    }
                                                                    <Card>
                                                                        <FormControl>
                                                                            <Switch
                                                                                {...register(`dataStructures.${index}.operations.${operationIndex}.oIsCollection`)}
                                                                                checked={op.value}
                                                                                onCheckedChange={(checked) => handleIsCollectionChecked(checked as boolean, index, operationIndex)}
                                                                            />
                                                                        </FormControl>

                                                                        <FormControl>
                                                                            <Switch
                                                                                {...register(`dataStructures.${index}.operations.${operationIndex}.oAssociationMode`)}
                                                                                checked={op.value}
                                                                                onCheckedChange={(checked) => handleAssociationModeChecked(checked as boolean, index, operationIndex)}
                                                                            />
                                                                        </FormControl>
                                                                    </Card>
                                                                </div>
                                                            </FormControl>

                                                        );
                                                    })
                                                }
                                                {/* <Button className="p-2 mt-5" onClick={() => update(index,
                                                    {
                                                        ...fields[index],
                                                        operations:
                                                            [...fields[index].operations,
                                                            {
                                                                OId: uuidv4(),
                                                                OName: '',
                                                                oAssociationMode: false,
                                                                oIsCollection: false,
                                                                oType: '',
                                                                oEndpoint: '',
                                                                oComment: '',
                                                                oResponse: '',
                                                                oRequestBody: {},
                                                                oTargetObject: {}
                                                            }]
                                                    })}>Add Operation</Button> */}
                                                <Button
                                                    className="bg-blue-500 hover:bg-blue-400"
                                                    type="button"
                                                    onClick={() => addOperation(index)}
                                                >
                                                    Add Operation
                                                </Button>
                                            </div>
                                        </FormControl>
                                    </Card>
                                </FormControl>
                            );
                        })
                    }
                    <Button className="p-2 mt-5" onClick={() => append({ id: uuidv4(), name: '', givenName: '', operations: [] })}>Add DataStructure</Button>
                </div>


            </Card>
            <DevTool control={control} />

            <Button
                onClick={() => {
                    // Log the entire form state
                    console.log('Current form state:', form.getValues());

                    // Log specific form field values
                    console.log('Current apiTitle:', form.getValues('apiTitle'));
                    console.log('Current dataStructures:', form.getValues('dataStructures'));
                }}
            >
                Log Form State
            </Button>

        </Form >
    );
};
