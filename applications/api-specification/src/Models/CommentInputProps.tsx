/* 
 * Props which are passed to / accepted by the functional component -  CommentInput
 * index - index of the selected data structure
 * operationIndex - index of the associated operation
 * register - connection with react-hook-forms
 */
export interface CommentInputProps 
{
    index: number; 
    operationIndex: number;
    register: any;
}