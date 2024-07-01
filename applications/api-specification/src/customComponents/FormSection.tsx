import React from 'react';
import { Card } from '../components/ui/card';
import { FormSectionProps } from '../Props/FormSectionProps';

/* Component utilized for form division 
 * one of the formsections holds metadata such as API title, description, version and base URL
 * other section is dedicated to the datastructures and their operations
 */
const FormSection: React.FC<FormSectionProps> = ({ children }) => {
    return (
        <Card className="p-4 mt-5">
            {children}
        </Card>
    );
};

export default FormSection;
