import React from 'react';
import { Input } from '../components/ui/input';
import {LabeledInputProps} from '../Props/LabeledInputPorps';

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
