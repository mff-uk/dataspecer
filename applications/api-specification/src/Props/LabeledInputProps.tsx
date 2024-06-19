/* Props passed to LabeledInput Component */
export interface LabeledInputProps {
    label: string;
    id: string;
    register: any;
    required?: boolean;
    placeholder?: string;
}