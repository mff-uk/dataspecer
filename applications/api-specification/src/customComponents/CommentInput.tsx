import React from 'react';
import { Input } from '../components/ui/input';

/* 
 * Props which are passed to the functional component -  CommentInput
 * index - represents index of the comment
 * operationIndex - index of the associated operation
 * register - connection with react-hook-forms
 */
interface CommentInputProps 
{
    index: number; 
    operationIndex: number;
    register: any;
    //collectionLogicEnabled: boolean;
    //singleResourceLogicEnabled: boolean;
}

/* CommentInput - react functional component */
const CommentInput: React.FC<CommentInputProps> = ({ index, operationIndex, register}) => 
{
    //let path = '';

    // if (collectionLogicEnabled) 
    // {
    //     path = `dataStructures.${index}.collectionOperations.${operationIndex}.oComment`;
    // } 
    // else if (singleResourceLogicEnabled) 
    // {
    //     path = `dataStructures.${index}.singleResOperation.${operationIndex}.oComment`;
    // }
    // else
    // {
        const path = `dataStructures.${index}.operations.${operationIndex}.oComment`;
    //}

    return (
        <div className = "p-1 flex items-center">
            <label htmlFor = {`comment_${index}_${operationIndex}`}>
                Comment:
                </label>
            <Input
                id = {`comment_${index}_${operationIndex}`}
                placeholder = "Write your comment here"
                {...register(path)}
            />
        </div>
    );
};

export default CommentInput;
