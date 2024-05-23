import React, { useEffect, useState } from 'react';
import { Switch } from "../components/ui/switch";
import { DataStructure } from '@/Models/DataStructureNex';
import { IsCollectionSwitchProps } from '@/Props/IsCollectionSwitchProps';

// interface IsCollectionSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: (path: string, value: any) => void;
//     getValues: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
// }

const IsCollection: React.FC<IsCollectionSwitchProps> = ({
    index,
    operationIndex,
    register,
    setValue,
    getValues,
    dataStructureName,
    dataStructures,
    setIsCollection
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.isCollection`;

    const formState = register(path);

    const [currentIsCollection, setCurrentIsCollection] = useState(formState.value || false);

    useEffect(() => {
        const newValue = getValues(path);
        if (currentIsCollection !== newValue) {
            setCurrentIsCollection(newValue);
        }
    }, [currentIsCollection, getValues, path]);

    useEffect(() => {
        setIsCollection(currentIsCollection);
    }, [currentIsCollection, setIsCollection]);

    const handleSwitchChange = (checked: boolean) => {
        setValue(path, checked);  
        setCurrentIsCollection(checked); 
    };

    return (
        <div className="p-1 flex items-center">
            <label>Treat resource as a collection: </label>
            <Switch
                {...formState}
                checked={currentIsCollection}
                onCheckedChange={handleSwitchChange}
            />
        </div>
    );
};

export default IsCollection;


