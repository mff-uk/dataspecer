import { Alert, Box, Collapse, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePreviousValue } from "../../../utils/hooks/use-previous-value";

interface StringExamplesFieldProps {
    value: string[] | null,
    onChange: (value: string[] | null) => void;
    disabled?: boolean;
    regex?: string;
}

/**
 * React textarea-like component for providing simple examples for an attribute.
 */
export const StringExamplesField = (props: StringExamplesFieldProps) => {
    const {t} = useTranslation("detail");

    let regex: RegExp | null = null;
    try {
        regex = new RegExp(props.regex);
    } catch (e) { }
    const failedExamples = props.value?.filter(v => typeof v === "string" && v.length > 0 && regex !== null && !regex.test(v)) ?? [];
    const hasFailedExamples = failedExamples.length > 0;
    const prevHasFailedExamples = usePreviousValue(hasFailedExamples, failedExamples);

    return <Box sx={{mb: 3}}>
        <Typography variant="subtitle1" component="h2">
            {t('label string examples')}
        </Typography>

        <TextField
            multiline
            fullWidth
            variant="filled"
            hiddenLabel
            disabled={props.disabled}
            helperText={<>Each example on a separate line.</>}
            value={props.value?.join("\n") ?? ""}
            onChange={event => props.onChange(event.target.value.length > 0 ? event.target.value.split("\n") : null)}
            color={hasFailedExamples ? "warning" : undefined}
        />

        <Collapse in={hasFailedExamples} appear={false}>
            <Alert severity="warning" sx={{mt: 2}}>
                <Typography>
                    Some example values do not match the regular expression.
                </Typography>
                <ul>
                    {prevHasFailedExamples.map((example, key) => <li key={key}>{example}</li>)}
                </ul>
            </Alert>
        </Collapse>
    </Box>;
}
