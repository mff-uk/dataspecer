import React from 'react';
import { Card } from '../components/ui/card'; // Assuming you have a Card component

interface FormCardSectionProps {
    children: React.ReactNode;
}

const FormCardSection: React.FC<FormCardSectionProps> = ({ children }) => {
    return (
        <Card className="p-4 mt-5">
            {children}
        </Card>
    );
};

export default FormCardSection;
