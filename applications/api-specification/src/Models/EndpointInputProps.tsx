/* 
 * Props which are passed to the functional component -  EndpointInput
 * index - represents index of the selected data structure
 * operationIndex - index of the associated operation
 * register - connection with react-hook-forms
 */
export interface EndpointInputProps 
{
    index: number;
    operationIndex: number;
    register: any;
    dataStructureName: string;
    baseUrl: string;
}