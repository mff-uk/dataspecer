/* 
 * Props which are passed to the functional component -  LabeledInputProps
 * label - label string
 * index - id of the selected data structure
 * register - connection with react-hook-forms
 * required - specifies whether the input field needs to be filled
 */
export interface LabeledInputProps 
{
    label: string;
    id: string;
    register: any;
    required?: boolean;
}