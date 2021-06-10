import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {
    IdProvider,
    PimAssociation,
    PimAttribute,
    PimClass,
    PsmClass,
    Slovnik,
    SlovnikPimMetadata,
    Store
} from 'model-driven-data';
import {GlossaryNote} from "../slovnik.gov.cz/GlossaryNote";
import {LoadingDialog} from "../helper/LoadingDialog";

type entityType = PimAssociation | PimAttribute;


export const AddInterpretedSurroundingDialog: React.FC<{store: Store, isOpen: boolean, close: () => void, selected: (forClass: PsmClass, store: Store, attributes: PimAttribute[], associations: PimAssociation[]) => void, psmClass: PsmClass | null}> = ({store, isOpen, close, selected, psmClass}) => {

    // @ts-ignore
    const cimId: string = psmClass ? (store[psmClass?.psmInterpretation] as PimClass).pimInterpretation : "";

    const [loading, setLoading] = useState(false);
    const [surroundings, setSurroundings] = useState<Store>({});

    const [selectedEntities, setSelectedEntities] = useState<entityType[]>([]);
    const toggleSelectedEntities = (entity: entityType) => () => {
        if (selectedEntities.includes(entity)) {
            setSelectedEntities(selectedEntities.filter(a => a !== entity));
        } else {
            setSelectedEntities([...selectedEntities, entity])
        }
    }

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setSurroundings({});
            setSelectedEntities([]);

            const slovnik = new Slovnik(new IdProvider());
            slovnik.getSurroundings(cimId).then(result => {
                setSurroundings(result);
                setLoading(false);
            });
        }
    }, [isOpen, cimId]);

    if (!psmClass) return null;

    const attributes = Object.values(surroundings).filter(PimAttribute.is);
    const associations = Object.values(surroundings).filter(PimAssociation.is);
    const forwardAssociations = associations.filter(a => a.pimEnd[0].pimParticipant && (surroundings[a.pimEnd[0].pimParticipant] as PimClass)?.pimInterpretation === cimId);
    const backwardAssociations = associations.filter(a => a.pimEnd[1].pimParticipant && (surroundings[a.pimEnd[1].pimParticipant] as PimClass)?.pimInterpretation === cimId);

    return <Dialog onClose={close} open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle id="customized-dialog-title">
            Add interpreted surroundings
        </DialogTitle>

        {loading && <LoadingDialog />}

        {loading ||
            <DialogContent dividers>
                <Typography variant={"h6"}>Attributes</Typography>
                {attributes && attributes.map((entity: PimAttribute) =>
                    <ListItem key={entity.id} role={undefined} dense button onClick={toggleSelectedEntities(entity)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={selectedEntities.includes(entity)}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={entity.pimHumanDescription?.cs}>{entity.pimHumanDescription?.cs}</Typography>}>
                            <strong>{entity.pimHumanLabel?.cs}</strong>
                            {" "}
                            <GlossaryNote entity={entity as SlovnikPimMetadata} />
                        </ListItemText>
                    </ListItem>
                )}
                {attributes && attributes.length === 0 &&
                    <Typography color={"textSecondary"}>There are no attributes available.</Typography>
                }

                <Typography variant={"h6"}>Associations</Typography>
                {forwardAssociations && forwardAssociations.map((entity: PimAssociation) =>
                    <ListItem key={entity.id} role={undefined} dense button onClick={toggleSelectedEntities(entity)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={selectedEntities.includes(entity)}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={entity.pimHumanDescription?.cs}>{entity.pimHumanDescription?.cs}</Typography>}>
                            <strong>{entity.pimHumanLabel?.cs}</strong>
                            {" "}
                            <GlossaryNote entity={entity as SlovnikPimMetadata}/>
                            {" "}
                            {entity.pimEnd[1].pimParticipant &&
                                <span>({(surroundings[entity.pimEnd[1].pimParticipant] as PimClass).pimHumanLabel?.cs})</span>
                            }
                        </ListItemText>
                    </ListItem>
                )}

                {forwardAssociations.length === 0 &&
                    <Typography color={"textSecondary"}>There are no associations available.</Typography>
                }

                <Typography variant={"h6"}>Backward associations</Typography>
                {backwardAssociations && backwardAssociations.map((entity: PimAssociation) =>
                    <ListItem key={entity.id} role={undefined} dense button onClick={toggleSelectedEntities(entity)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={selectedEntities.includes(entity)}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={entity.pimHumanDescription?.cs}>{entity.pimHumanDescription?.cs}</Typography>}>
                            {entity.pimEnd[0].pimParticipant && <span>({(surroundings[entity.pimEnd[0].pimParticipant] as PimClass).pimHumanLabel?.cs})</span>}
                            {" "}
                            <strong>{entity.pimHumanLabel?.cs}</strong>
                            {" "}
                            <GlossaryNote entity={entity as SlovnikPimMetadata}/>
                        </ListItemText>
                    </ListItem>
                )}

                {backwardAssociations.length === 0 &&
                <Typography color={"textSecondary"}>There are no associations available.</Typography>
                }

            </DialogContent>
        }
        <DialogActions>
            <Button onClick={close} color="primary">Close</Button>
            <Button onClick={() => {close(); selected(psmClass, surroundings, selectedEntities.filter(PimAttribute.is), selectedEntities.filter(PimAssociation.is))}} disabled={selectedEntities.length === 0} color="secondary">Confirm</Button>
        </DialogActions>
    </Dialog>;
}