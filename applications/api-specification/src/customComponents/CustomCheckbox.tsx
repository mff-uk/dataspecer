import React from 'react';
import { CustomCheckboxProps } from '../Models/CustomCheckboxProps';

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange }) => 
{
    return (
        <div>
            <label className = "mr-2">{label}</label>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
        </div>
    );
};

export default CustomCheckbox;
