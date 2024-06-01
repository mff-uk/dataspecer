import { DataStructure } from '../Models/DataStructureModel';
import { BaseProps } from './BaseProps';

/* Props passed to the IsAssociation component */
export interface IsAssociationProps extends BaseProps {
    setValue: (path: string, value: any) => void;
    getValues: any;
    dataStructureName: string;
    dataStructures: DataStructure[];
    setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
    setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
    setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>;
    defaultValue: string;
}