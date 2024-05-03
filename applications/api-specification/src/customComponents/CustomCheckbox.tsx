import React from 'react';

/* Props which are passed to the functional component -  CustomCheckbox */
interface CustomCheckboxProps 
{
    label: string;
    checked: boolean;
    onChange: () => void;
}

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
