import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './components/ui/button';
import LabeledInput from './customComponents/LabeledInput';
import FormSection from './customComponents/FormSection';
import DataStructuresSelect from './customComponents/DataStructSelect';
import { generateOpenAPISpecification } from './OApiGenerator';
import { useDataSpecificationInfo } from './DataStructureFetcher';
import OperationCard from './customComponents/OperationCard';
import { DataStructure, Field } from '@/Models/DataStructureModel';
import useSWR from 'swr';
import { zodResolver } from '@hookform/resolvers/zod'
import OpenApiDisplay from './customComponents/OpenAPIDisplay';
import { FormValues } from './Models/FormValuesModel';
import { formValidationchema } from './FormValidationSchema';

/* Fetcher for fetching presaved data */
const fetchSavedConfig = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch configuration');
    }

    return response.json();
};

export const MainForm = () => {

    const { register, handleSubmit, control, watch, setValue, getValues, formState } = useForm<FormValues>({
        resolver: zodResolver(formValidationchema)
    });

    const { errors } = formState;

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dataStructures",
    });

    const [selectedDataStructures, setSelectedDataStructures] = useState<Array<any>>([]);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        const dataStructures = watch("dataStructures");
        setSelectedDataStructures(dataStructures)
    }, [watch]);

    const [fetchedDataStructuresArr, setFetchedDataStructuresArr] = useState([]);

    const { fetchDataStructures } = useDataSpecificationInfo();

    /* START - GET Presaved configuration */
    const getModelIri = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('model-iri');
    };

    const modelIri = getModelIri();

    const { data: preSavedData, error: fetchError } = useSWR(`https://backend.dataspecer.com/resources/blob?iri=${encodeURIComponent(modelIri)}`, fetchSavedConfig);

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

    useEffect(() => {
        if (preSavedData) {
            //console.log('Fetched Data:', preSavedData);
            setValue('apiTitle', preSavedData.apiTitle);
            setValue('apiDescription', preSavedData.apiDescription);
            setValue('apiVersion', preSavedData.apiVersion);
            setValue('baseUrl', preSavedData.baseUrl);
            setValue('dataStructures', preSavedData.dataStructures);
            setSelectedDataStructures(preSavedData.dataStructures);
            setFetchingData(false);
        }
    }, [preSavedData, setValue]);


    const [openAPISpec, setOpenAPISpec] = useState<any>({});


    const onSubmit: SubmitHandler<FormValues> = async (data, event) => {
        event.preventDefault();

        const newData = getValues();

        const getModelIri = () => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('model-iri');
        };

        const modelIri = getModelIri();

        try {

            const newOpenAPISpec = generateOpenAPISpecification(fetchedDataStructuresArr, newData);
            setOpenAPISpec(newOpenAPISpec);


            const response = await fetch(`https://backend.dataspecer.com/resources/blob?iri=${encodeURIComponent(modelIri)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newData),
                });

            if (response.ok) {
                //console.log('Form data saved successfully. Submitted data is: ' + JSON.stringify(newData));
            } else {
                console.error('Failed to save form data.');
            }
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Form validation failed:', error.errors);
                error.errors.forEach(({ path, message }) => {
                    const field = path[0] as keyof FormValues;
                    formState.errors[field] = { message } as any;
                });
            } else {
                console.error('Form validation failed:', error.message);
            }
        }


    };


    const addOperation = (index: number) => {

        const defaultDataStructure: DataStructure = {
            id: '',
            name: '',
            givenName: '',
            fields: []
        };

        const newOperation = {
            name: '',
            isCollection: false,
            oAssociatonMode: false,
            oType: '',
            oName: '',
            oEndpoint: '',
            oComment: '',
            oResponse: '',
            oRequestBody: {},
            oResponseObject: defaultDataStructure
        };


        update(index, {
            ...fields[index],
            operations: [...fields[index].operations, newOperation],
        });

        setSelectedDataStructures((prevState) => {
            const newState = [...prevState];
            if (!newState[index]) {
                newState[index] = { operations: [] };
            }
            newState[index] = { ...newState[index], operations: newOperation };
            return newState;
        });

        console.log(...fields[index].operations)
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
        <div className="flex flex-row gap-8">
            <div className="flex flex-col gap-4 w-1/2">
                {/* first column */}
                <form className="flex flex-col gap-4 p-4" onSubmit={(e) => {
                    handleSubmit(onSubmit)(e);
                }}>
                    {/* Form Info */}

                    <FormSection>
                        <LabeledInput label="API Title" id="apiTitle" register={register} required />
                        {errors.apiTitle && <p className='text-red-500 text-sm'>{errors.apiTitle?.message}</p>}
                        <LabeledInput label="API Description" id="apiDescription" register={register} required />
                        {errors.apiDescription && <p className='text-red-500 text-sm'>{errors.apiDescription?.message}</p>}
                        <LabeledInput label="API Version" id="apiVersion" register={register} required />
                        {errors.apiVersion && <p className='text-red-500 text-sm'>{errors.apiVersion?.message}</p>}
                        <LabeledInput label="Base URL" id="baseUrl" register={register} required />
                        {errors.baseUrl && <p className='text-red-500 text-sm'>{errors.baseUrl?.message}</p>}
                    </FormSection>

                    {/* Data Structures */}
                    <FormSection>
                        <h3>Data Structures:</h3>
                        {fields.map((field, index) => (
                            <FormSection key={field.id}>
                                <div className="flex flex-row justify-between">
                                    <div>
                                        <label>Choose Data Structure:</label>
                                        <DataStructuresSelect
                                            key={`dataStructureSelect_${index}`}
                                            index={index}
                                            register={register}
                                            dataStructures={fetchedDataStructuresArr}

                                            onChange={(selectedDataStructure) => {

                                                console.log("Selected ds is: " + JSON.stringify(selectedDataStructure));
                                                register(`dataStructures.${index}.name`).onChange({
                                                    target: {
                                                        value: selectedDataStructure.name,
                                                    },
                                                });

                                                setSelectedDataStructures((prevState) => {
                                                    const newState = Array.isArray(prevState) ? [...prevState] : [];
                                                    newState[index] = selectedDataStructure;
                                                    return newState;
                                                });

                                                update(index, {
                                                    ...fields[index],
                                                    name: selectedDataStructure.givenName,
                                                });
                                            }} getValues={getValues} />
                                    </div>
                                    <Button className="bg-red-500 hover:bg-red-400" type="button" onClick={() => remove(index)}>
                                        Delete
                                    </Button>
                                </div>



                                {/* Operations */}
                                <FormSection>
                                    <h4>Operations:</h4>
                                    {!fetchingData && field.operations.map((op, opIndex) => (
                                        <OperationCard
                                            defaultValue={preSavedData?.dataStructures?.[index]?.operations?.[opIndex]?.oResponseObject?.givenName || ''}
                                            key={opIndex}
                                            operationIndex={opIndex}
                                            removeOperation={removeOperation}
                                            index={index}
                                            register={register}
                                            setValue={setValue}
                                            getValues={getValues}
                                            selectedDataStructure={selectedDataStructures[index]?.givenName || selectedDataStructures[index]?.name}
                                            fetchedDataStructures={fetchedDataStructuresArr}
                                            selectedDataStruct={selectedDataStructures} />
                                    ))}

                                    {/* Add operation button */}
                                    <Button
                                        className="zbg-blue-500 hover:bg-blue-400"
                                        type="button"
                                        onClick={() => addOperation(index)}
                                    >
                                        Add Operation
                                    </Button>

                                </FormSection>

                                {errors.dataStructures && errors.dataStructures[index]?.operations?.root?.message && (
                                    <p className="text-red-500 text-sm">{errors.dataStructures[index].operations.root.message}</p>
                                )}

                            </FormSection>
                        ))}
                        <Button
                            className="bg-blue-500 hover:bg-blue-400"
                            type="button"
                            onClick={() => append({ name: '', operations: [] })}
                        >
                            Add Data Structure
                        </Button>

                    </FormSection>

                    {/* Submit Button */}
                    <Button type="submit">Generate OpenAPI Specification</Button>
                </form>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-4 w-1/2">
                <div className="flex - grow">
                    <OpenApiDisplay generatedOpenAPISpecification={openAPISpec} />
                </div>

            </div>
        </div>
    );
};
