import { z } from 'zod';

export const formValidationchema = z.object({
    apiTitle: z.string().min(1).regex(/^[a-zA-Z]+$/, { message: "Please enter a valid API Title." }),
    apiDescription: z.string().min(1), // non-empty string
    apiVersion: z.string().regex(/^\d+\.\d+$/, { message: "Please enter a valid API Version. \nExample: 1.0" }),
    baseUrl: z.string().regex(/^https:\/\/\w+\.\w+$/, { message: "BaseURL has to be in the following format: https://someUrl.com" }),
    dataStructures: z.array(
        z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            operations: z.array(
                z.object({
                    name: z.string().optional(),
                    isCollection: z.boolean(),
                    oAssociatonMode: z.boolean(),
                    oType: z.string(),
                    oName: z.string().min(1, { message: "Name of the Operation caanot be empty" }),
                    oEndpoint: z.string().min(1, { message: "Endpoint cannot be empty" }),
                    oComment: z.string(),
                    oResponse: z.string(),
                })
            ).refine((operations) => {
                const combinations = new Set();
                for (const operation of operations) {
                    const combination = `${operation.oEndpoint}-${operation.oType}`;
                    if (combinations.has(combination)) {
                        return false;
                    }
                    combinations.add(combination);
                }
                return true;
            }, { message: "Error: Each combination of endpoint and operation type must be unique within each data structure." })
                .refine((operations) => {
                    const oNames = new Set();
                    for (const operation of operations) {
                        if (oNames.has(operation.oName)) {
                            return false;
                        }
                        oNames.add(operation.oName);
                    }
                    return true;
                }, { message: "Error: Operation name must be unique." })
        })
    ).optional(),
});