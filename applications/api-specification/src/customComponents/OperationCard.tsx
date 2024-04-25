import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Switch } from "../components/ui/switch.tsx";
import { Card } from '../components/ui/card';
import OperationTypeSelect from '../customComponents/OperationTypeSelect';
import OperationNameInput from '../customComponents/OperationNameInput';
import EndpointInput from '../customComponents/EndpointInput';
import CommentInput from '../customComponents/CommentInput';
import StatusCodeSelect from './HttpStatusCode';
import RequestBodyComponent from './RequestBodyComponent';
import DataStructuresSelect from './DataStructSelect';
import Association from '../customComponents/IsAssociationSwitch.tsx';

//import ResponseObjectComponent from './ResponseObjectSelect';

interface OperationCardProps {
    operationIndex: number;
    removeOperation: (index: number, operationIndex: number) => void;
    index: number;
    register: any;
    setValue: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
    baseUrl: string;
    selectedDataStructure: string;
    fetchedDataStructures: DataStructure[]
}

const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, setValue, collectionLogicEnabled, singleResourceLogicEnabled, baseUrl, selectedDataStructure, fetchedDataStructures }) => {
    
    const [selectedResponseObject, setSelectedResponseObject] = useState(null);
    const [responseObjectFields, setResponseObjectFields] = useState([]);

    return (
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
                <Card className="justify-end">
                    {/* Association Mode*/}
                    <Association
                        index = {index}
                        operationIndex = {operationIndex}
                        register = {register}
                        setValue = {setValue}
                        dataStructureName={selectedDataStructure}
                        dataStructures={fetchedDataStructures}
                        setSelectedResponseObject={setSelectedResponseObject}
                        setResponseObjectFields={setResponseObjectFields}
                    />
                    {/* Operation Name */}
                    <OperationNameInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* Operation Type */}
                    <OperationTypeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructure={selectedDataStructure}
                        allDataStructures={fetchedDataStructures}
                        setValue={setValue}
                        responseObjectFields = {responseObjectFields}
                        selectedResponseObject = {selectedResponseObject}
                    //collectionLogicEnabled={collectionLogicEnabled}
                    //singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* Endpoint */}
                    <EndpointInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                        dataStructureName={selectedDataStructure}
                        baseUrl={baseUrl} />
                    {/* Comment */}
                    <CommentInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* <RequestBodyComponent
                        dataStructure={selectedDataStructure}
                        allDataStructures={fetchedDataStructures}
                        operationIndex={operationIndex}
                        index={index}
                        register={register}
                        setValue = {setValue} /> */}
                    {/* Http StatusCode */}
                    <StatusCodeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {
                        // If datastructure{index}.operations.{operationIndex}.isAssociation == true 
                        // show Target Object     

                        /**/
                    }

                    {/* <div>
                        <label>Choose Data Structure:</label>
                        <DataStructuresSelect
                            key={`responseObject_${index}`}
                            index={index}
                            operationIndex={operationIndex}
                            register={register}
                            dataStructures={fetchedDataStructures}
                            isResponseObj={true}
                            onChange={(selectedDataStructure) => {
                                register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
                                    target: {
                                        value: selectedDataStructure.name,
                                    },
                                });
                            }} />
                    </div> */}
                </Card>
            </Card>
        </div>
    );
};

export default OperationCard;
