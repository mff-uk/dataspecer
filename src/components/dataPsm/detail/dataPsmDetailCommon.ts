import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

export const useDetailStyles = makeStyles((theme: Theme) =>
    createStyles({
      internalIri: {
        width: "100%",
        wordBreak: "break-all",
        color: theme.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
      },
      section: {
        margin: "1rem 0",
      },
      dialogTitle: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
      fullContainer: {
        margin: "1rem 0",
      },
      closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.primary.contrastText,
      },
      card: {
        borderLeft: "3px solid " + theme.palette.primary.main,
      }
    }),
);
