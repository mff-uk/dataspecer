import React, { useEffect, useState } from 'react';
import { Switch } from "../components/ui/switch";
import { DataStructure } from '@/Models/DataStructureModel';
import { IsCollectionSwitchProps } from '@/Props/IsCollectionSwitchProps';

/* IsCollection - react functional component
 * The value of this component determines whether the operation is
 * a collection manipulation or operation targeted at a single resource
 */
const IsCollection: React.FC<IsCollectionSwitchProps> = ({
    index,
    operationIndex,
    register,
    setValue,
    getValues,
    setIsCollection
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.isCollection`;

    const formState = register(path);

    const [currentIsCollection, setCurrentIsCollection] = useState(formState.value || false);

    /* syncing local state with the form state */
    useEffect(() => {
        const newValue = getValues(path);
        if (currentIsCollection !== newValue) {
            setCurrentIsCollection(newValue);
        }
    }, [currentIsCollection, getValues, path]);

    /* update parent's state on local state change */
    useEffect(() => {
        setIsCollection(currentIsCollection);
    }, [currentIsCollection, setIsCollection]);

    const handleSwitchChange = (checked: boolean) => {
        setValue(path, checked);
        setCurrentIsCollection(checked);
    };

    return (
        <div className="p-1 flex items-center">
            <label>Manipulate a collection: </label>
            <Switch
                {...formState}
                checked={currentIsCollection}
                onCheckedChange={handleSwitchChange}
            />
        </div>
    );
};

export default IsCollection;


