import React from 'react';
import { Input } from '../components/ui/input';
import { LabeledInputProps } from '../Props/LabeledInputProps';

/* LabeledInput - react functional component 
 * This component is utilized for metadata inputs 
 * such as API title, description etc. 
 */
const LabeledInput: React.FC<LabeledInputProps> = ({ label, id, register, required, placeholder }) => {
    return (
        <div className="p-1 flex items-center">
            <label htmlFor={id} className="mr-2">{label}: </label>
            <div style={{ flex: 1 }}>
                <Input
                    id={id}
                    placeholder={placeholder}
                    required={required}
                    {...register(id)}
                />
            </div>
        </div>
    );
};

export default LabeledInput;
