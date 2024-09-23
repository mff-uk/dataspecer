import TextField from "@mui/material/TextField";
import { useState } from "react";
import { InputAdornment } from "@mui/material";

type UserInputProps = {
    label: string;
    id: string;
    required?: boolean;
    placeholder?: string;
    zipNameState: [string | null, React.Dispatch<React.SetStateAction<string | null>>]
}

export const OutputFilenameInput: React.FC<UserInputProps> = ({ label, id, required, placeholder, zipNameState }) => {

    const [resultZipName, setResultZipName] = zipNameState;
    const handleOutputZipName = (event: any) => {
        setResultZipName(event.target.value);
    }

    return (
        <div className="p-1 flex items-center">
            <label htmlFor={id} className="mr-2">{label}: </label>
            <div style={{ flex: 1 }}>
                <TextField
                    id={id}
                    placeholder={placeholder}
                    required={required}
                    variant="outlined"
                    onChange={handleOutputZipName}
                    size="small"
                    margin="normal"
                    error={!resultZipName}
                    style={{ width: "20rem" }}
                    slotProps={{
                        input: { endAdornment: <InputAdornment position="end">.zip</InputAdornment> },
                    }}
                />
            </div>
        </div>
    );
}