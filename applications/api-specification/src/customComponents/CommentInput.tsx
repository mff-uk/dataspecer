import React from 'react';
import { Input } from '../components/ui/input';
import { CommentInputProps } from '../Props/CommentInputProps';

/* CommentInput - react functional component */
const CommentInput: React.FC<CommentInputProps> = ({ index, operationIndex, register}) => 
{
    const path = `dataStructures.${index}.operations.${operationIndex}.oComment`;

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
