import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {IdProvider, PimAssociation, PimAttribute, PimClass, Slovnik, Store} from 'model-driven-data';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';


export const AddInterpretedSurroundingDialog: React.FC<{isOpen: boolean, close: () => void, selected: (store: Store, attributes: PimAttribute[], associations: PimAssociation[]) => void, cimId: string}> = ({isOpen, close, selected, cimId}) => {
    const [loading, setLoading] = useState(false);
    const [surroundings, setSurroundings] = useState<Store>({});
    const [selectedAssociations, setSelectedAssociations] = useState<PimAssociation[]>([]);

    const toggleAssociations = (entity: PimAssociation) => () => {
        if (selectedAssociations.includes(entity)) {
            setSelectedAssociations(selectedAssociations.filter(a => a !== entity));
        } else {
            setSelectedAssociations([...selectedAssociations, entity])
        }
    }

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setSurroundings({});
            setSelectedAssociations([]);

            const slovnik = new Slovnik(new IdProvider());
            slovnik.getSurroundings(cimId).then(result => {
                console.log(result);
                setSurroundings(result);
                setLoading(false);
            });
        }
    }, [isOpen, cimId]);

    const entityAttributes = Object.values(surroundings).filter(PimAttribute.is);
    const entityAssociations = Object.values(surroundings).filter(PimAssociation.is);

    return <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle id="customized-dialog-title">
            Add interpreted surroundings
        </DialogTitle>

        {loading &&
            <DialogContent dividers>
                loading...
            </DialogContent>
        }

        {loading ||
            <DialogContent dividers>
                <Typography variant={"h6"}>Attributes</Typography>
                {entityAttributes && entityAttributes.map((entity: PimAttribute) =>
                    <ListItem key={entity.id} role={undefined} dense button>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                //checked={checked.indexOf(value) !== -1}
                                tabIndex={-1}
                                disableRipple
                                //inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText primary={entity.pimHumanLabel?.cs} secondary={entity.pimHumanDescription?.cs}/>
                    </ListItem>
                )}
                {entityAttributes && entityAttributes.length === 0 &&
                    <Typography color={"textSecondary"}>There are no attributes available.</Typography>
                }

                <Typography variant={"h6"}>Associations</Typography>
                {entityAssociations && entityAssociations.map((entity: PimAssociation) =>
                    <ListItem key={entity.id} role={undefined} dense button onClick={toggleAssociations(entity)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={selectedAssociations.includes(entity)}
                                tabIndex={-1}
                                disableRipple
                                //inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText secondary={entity.pimHumanDescription?.cs}>
                            { surroundings && entity.pimEnd[0].pimParticipant && (surroundings[entity.pimEnd[0].pimParticipant] as PimClass)?.pimInterpretation === cimId &&
                                <Grid container direction="row" alignItems="center">
                                    <ArrowForwardIcon fontSize={"small"} />
                                    <strong style={{margin: "0 1em"}}>{entity.pimHumanLabel?.cs}</strong>
                                    {entity.pimEnd[1].pimParticipant && (surroundings[entity.pimEnd[1].pimParticipant] as PimClass).pimHumanLabel?.cs}
                                </Grid>
                            }

                            { surroundings && entity.pimEnd[1].pimParticipant && (surroundings[entity.pimEnd[1].pimParticipant] as PimClass)?.pimInterpretation === cimId &&
                                <Grid container direction="row" alignItems="center">
                                    {entity.pimEnd[0].pimParticipant && (surroundings[entity.pimEnd[0].pimParticipant] as PimClass).pimHumanLabel?.cs}{' '}
                                    <strong style={{margin: "0 1em"}}>{entity.pimHumanLabel?.cs}</strong>
                                    <ArrowForwardIcon fontSize={"small"} />
                                </Grid>
                            }
                        </ListItemText>
                    </ListItem>
                )}

                {entityAssociations && entityAssociations.length === 0 &&
                <Typography color={"textSecondary"}>There are no associations available.</Typography>
                }
            </DialogContent>
        }
        <DialogActions>
            <Button onClick={close} color="primary">Close</Button>
            <Button onClick={() => {close(); selected(surroundings, [], selectedAssociations)}} disabled={selectedAssociations.length === 0} color="secondary">Confirm</Button>
        </DialogActions>
    </Dialog>;
}