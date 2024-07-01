import React from 'react';
import { CustomCheckboxProps } from '../Props/CustomCheckboxProps';

/* CustomCheckbox - react functional component 
 * utilized for determining if the association mode is on/off
 * as well as for determining whether collection is manipulated or a single resource 
 */
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange }) => {
    return (
        <div>
            <label className="mr-2">{label}</label>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
        </div>
    );
};

export default CustomCheckbox;
