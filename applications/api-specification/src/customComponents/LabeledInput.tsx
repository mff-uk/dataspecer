import React from 'react';
import { Input } from '../components/ui/input';

/* 
 * Props which are passed to the functional component -  LabeledInputProps
 * label - label string
 * index - id of the selected data structure
 * register - connection with react-hook-forms
 * required - specifies whether the input field needs to be filled
 */
interface LabeledInputProps 
{
    label: string;
    id: string;
    register: any;
    required?: boolean;
}

/* LabeledInput - react functional component */ 
const LabeledInput: React.FC<LabeledInputProps> = ({ label, id, register, required }) => 
{
    return (
        <div className = "p-1 flex items-center">
            <label htmlFor = {id} className="mr-2">{label}: </label>
            <div style={{ flex: 1 }}>
                <Input
                    id = {id}
                    required = {required}
                    {...register(id)}
                />
            </div>
        </div>
    );
};

export default LabeledInput;
