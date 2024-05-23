// export interface EndpointInputProps 
// {
//     index: number;
//     operationIndex: number;
//     register: any;
//     dataStructureName: string;
//     baseUrl: string;
// }

import {BaseProps} from './BaseProps';

export interface EndpointInputProps extends BaseProps 
{
    dataStructureName: string;
    baseUrl: string;
}