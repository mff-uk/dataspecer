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
                    name: z.string(),
                    isCollection: z.boolean(),
                    oAssociatonMode: z.boolean(),
                    oType: z.string(),
                    oName: z.string(),
                    oEndpoint: z.string(),
                    oComment: z.string(),
                    oResponse: z.string(),
                    // oRequestBody: z.record(z.boolean()).optional(),
                    // oResponseObject: z.object({}).optional()
                })
            ).refine((operations) => {
                const combinationSet = new Set();
                for (const operation of operations) {
                    const combination = `${operation.oEndpoint}-${operation.oType}`;
                    if (combinationSet.has(combination)) {
                        return false;
                    }
                    combinationSet.add(combination);
                }
                return true;
            }, { message: "Each combination of oEndpoint and oType must be unique within each data structure." })
        })
    ).optional(),
});