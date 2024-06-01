import React from 'react';
import { Card } from '../components/ui/card';
import { FormSectionProps } from '../Props/FormSectionProps';


const FormSection: React.FC<FormSectionProps> = ({ children }) => {
    return (
        <Card className="p-4 mt-5">
            {children}
        </Card>
    );
};

export default FormSection;
