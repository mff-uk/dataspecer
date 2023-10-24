import { Alert, Box, Collapse, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface RegexFieldProps {
    value: string,
    onChange: (value: string) => void;
    disabled?: boolean;
    forIri: boolean;
}

function getRegexError(value: string): string | null {
    try {
        new RegExp(value);
        return null;
    } catch (e) {
        return e.message;
    }
}

/**
 * React component for typing a regular expression for an attribute.
 */
export const RegexField = (props: RegexFieldProps) => {
    const {t} = useTranslation("detail");

    const error = getRegexError(props.value);

    return <Box sx={{mb: 3}}>
        <Typography variant="subtitle1" component="h2">
            {props.forIri ? t('label regex for iri') : t('label regex for value')}
        </Typography>
        <TextField
            autoFocus
            disabled={props.disabled}
            margin="dense"
            hiddenLabel
            fullWidth
            variant="filled"
            value={props.value}
            onChange={event => props.onChange(event.target.value)}
            helperText={<>For example <code>^[0-9]+$</code> or <code>^[a-z-]+$</code>.</>}
            error={error !== null}
            /* onKeyDown={event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    onConfirm().then();
                }
            }}*/
        />

        <Collapse in={error !== null} appear={false}>
            <Alert severity="error">{error}</Alert>
        </Collapse>
    </Box>;
}