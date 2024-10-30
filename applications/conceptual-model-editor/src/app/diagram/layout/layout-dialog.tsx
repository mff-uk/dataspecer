import { MouseEvent, useState } from "react";
import { DIRECTION, AlgorithmName, UserGivenConstraintsVersion4, ElkForceAlgType, getDefaultUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4, getDefaultMainUserGivenAlgorithmConstraint, UserGivenAlgorithmConfiguration } from "@dataspecer/layout";
import _ from "lodash";
import LayeredAlgorithmDirectionDropdown from "./react-combobox";


type MainType = "main";
type MainOrGeneralType = MainType | "general";

// TODO:
// 1) Make it more general - a lot of repeating code and the same strings on multiple of places (create new react components or something)
// 2) Make it map to the Constraint interface (and pass only the relevant settings further) ... and better typing - kinda done
// 3) Style it better - but it is kind of throwaway so it doesn't really matter
// 4) Have dialog localization
export const useConfigDialog = () => {
    const [config, setConfig] = useState<UserGivenConstraintsVersion4>(getDefaultUserGivenConstraintsVersion4());

    // const updateConfig = (key: string, e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    //     setConfig({...config, [key]: parseInt(e.target.value)});
    // }



    // Before V2 we tried filtering, right now just put in everything and pick the correct ones, the responsibility on picking correct one should lie in the layout package anyways
    // TODO: So it may be renamed to getConfig instead
    const getValidConfig = () => {
        return config;
    };

    const resetConfig = () => {
        if(!_.isEqual(config, getDefaultUserGivenConstraintsVersion4())) {
            setConfig(getDefaultUserGivenConstraintsVersion4());
        }
    };


    // const ConfigSlider = (props: {
    //     min: number;
    //     max: number;
    //     step: number;
    //     configName: string;
    //     defaultValue: number;
    //     setConfig: () => void;
    // }) => {
    //     return <input type="range" min={props.min} max={props.max} step={props.step}
    //     className="slider" id={`range- + ${props.configName}`} draggable="false" defaultValue={props.defaultValue} onMouseUp={(e) => { setConfig({...config, [props.configName]: parseInt(e.target.value)});}}></input>
    // }


    const RadialConfig = (props: {stateField: MainType}) => {
        return <div>
            <h1 className='font-black'>Nastavení radiálního modelu</h1>
            <div className="flex flex-row">
                <label htmlFor="range-min-distance-between-nodes">Min vzdálenost mezi vrcholy: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id="range-min-distance-between-nodes" draggable="false"
                        defaultValue={config?.[props.stateField]?.elk_radial?.["min_distance_between_nodes"]}
                        onMouseUp={(e) => { setConfig({
                                                    ...config,
                                                    [props.stateField]: {
                                                            ...config[props.stateField],
                                                            [config.chosenMainAlgorithm]: {
                                                                ...config[props.stateField][config.chosenMainAlgorithm],
                                                                "min_distance_between_nodes": parseInt((e.target as HTMLInputElement).value)
                                                            }
                                                        }
                                                    });
                                                    {/* Have to recast, like in https://stackoverflow.com/questions/42066421/property-value-does-not-exist-on-type-eventtarget
                                                        (Not sure if the type is correct, but it contains value so it shouldn't really matter) */}
                                            }}></input>
                {config?.[props.stateField]?.elk_radial?.["min_distance_between_nodes"]}
            </div>
        </div>;
    };

    const RunLayeredAfterCombobox = (props: {stateField: MainType}) => {
        return <div>
                    <input type="checkbox" id="checkbox-run-layered-after" name="checkbox-run-layered-after" checked={config?.[props.stateField]?.[config.chosenMainAlgorithm]?.run_layered_after}
                    onChange={e => {
                        setConfig({
                            ...config,
                            [props.stateField]: {
                                    ...config[props.stateField],
                                    [config.chosenMainAlgorithm]: {
                                        ...config[props.stateField][config.chosenMainAlgorithm],
                                        "run_layered_after": e.target.checked,
                                    }
                                }
                            });
                        }} />
                    <label htmlFor="checkbox-run-layered-after">Run layered after</label>
                </div>;
    };

    const interactiveCheckbox = (props: {algorithmName: AlgorithmName, stateField: MainOrGeneralType}) => {
        return <div>
            <input type="checkbox" id={`checkbox-interactive${props.stateField}`} name="checkbox-interactive"
                    checked={(config?.[props.stateField] as Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>)?.[config.chosenMainAlgorithm]?.interactive}
                    onChange={e => {
                        setConfigWithNewValue(props.algorithmName, props.stateField, "interactive", e.target.checked);
                        }} />
            <label htmlFor={`checkbox-interactive${props.stateField}`}>Vezmi v úvahu existující layout</label>
        </div>;
    };

    const ForceConfig = (props: {stateField: MainType}) =>
        <div>
            <h1 className='font-black'>Nastavení fyzikálního modelu</h1>
            <div className="flex flex-row">
                <label htmlFor="range-min-distance-between-nodes">Min vzdálenost mezi vrcholy: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id="range-min-distance-between-nodes" draggable="false"
                        defaultValue={config?.[props.stateField].elk_force?.["min_distance_between_nodes"]}
                        onMouseUp={(e) => {
                            setConfigWithNewValue("elk_force", props.stateField, "min_distance_between_nodes", parseInt((e.target as HTMLInputElement).value));
                                            }}></input>
                {config?.[props.stateField].elk_force?.["min_distance_between_nodes"]}

            </div>
            {/* TODO: Copy paste from force algorithm */}
            <div className="flex flex-row">
                <label htmlFor="range-iteration-count">Počet různých běhů algoritmu: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="200" step="1" className="slider" id="range-iteration-count" draggable="false"
                    defaultValue={config?.[props.stateField].elk_force?.["number_of_new_algorithm_runs"]}
                    onMouseUp={(e) => {
                        setConfigWithNewValue("elk_force", props.stateField, "number_of_new_algorithm_runs", parseInt((e.target as HTMLInputElement).value));
                                        }}></input>
                {config?.[props.stateField].elk_force?.["number_of_new_algorithm_runs"]}
            </div>


            <div className="flex flex-row">
                <label htmlFor="force-alg-type">Typ výpočtu: </label>
            </div>
            <div className="flex flex-row">
                <select id="force-alg-type" value={config?.[props.stateField].elk_force?.["force_alg_type"]} onChange={(event) => {
                                setConfigWithNewValue("elk_force", props.stateField, "force_alg_type", event.target.value as ElkForceAlgType);
                                // // Based on https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
                                // setConfig({...config,
                                //            [props.stateField]: {
                                //                 ...config[props.stateField],
                                //                 "force_alg_type": event.target.value as ElkForceAlgType }});
                    }}>
                    <option value="EADES">Eades</option>
                    <option value="FRUCHTERMAN_REINGOLD">Fruchterman Reingold</option>
                </select>
            </div>
            {interactiveCheckbox({...props, algorithmName: "elk_force"})}
            <RunLayeredAfterCombobox stateField={props.stateField}></RunLayeredAfterCombobox>
        </div>;

    function setConfigWithNewValue<T>(algorithmName: AlgorithmName, stateField: Partial<MainOrGeneralType>, nameOfParameterToChange: string, newValue: T) {
        if(stateField === "general" && algorithmName !== "elk_layered") {

            return;
        }
        const algorithmSettings = (config?.[stateField] as Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>)?.[algorithmName];
        if(algorithmSettings === undefined) {
            return;
        }
        setConfig({
                    ...config,
                    [stateField]: {
                        ...config[stateField],
                        [algorithmName]: {
                            ...algorithmSettings,
                            [nameOfParameterToChange]: newValue,
                        }
                    }
                });
                {/* Have to recast, like in https://stackoverflow.com/questions/42066421/property-value-does-not-exist-on-type-eventtarget
                    (Not sure if the type is correct, but it contains value so it shouldn't really matter) */}
    }

    const StressConfig = (props: {stateField: MainType}) =>
        <div>
            <h1 className='font-black'>Nastavení fyzikálního modelu</h1>
            <div className="flex flex-row">
                <label htmlFor="range-stress-edge-len">Ideální délka hran: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id="range-stress-edge-len" draggable="false"
                        defaultValue={config?.[props.stateField]?.elk_stress?.["stress_edge_len"]}
                        onMouseUp={(e) => {
                            setConfigWithNewValue("elk_stress", props.stateField, "stress_edge_len", parseInt((e.target as HTMLInputElement).value));
                            }
                        }
                                ></input>
                {config?.[props.stateField]?.elk_stress?.["stress_edge_len"]}
            </div>
            {/* TODO: Copy paste from force algorithm */}
            <div className="flex flex-row">
                <label htmlFor="range-iteration-count">Počet různých běhů algoritmu: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="200" step="1" className="slider" id="range-iteration-count" draggable="false"
                    defaultValue={config?.[props.stateField]?.elk_stress?.["number_of_new_algorithm_runs"]}
                    onMouseUp={(e) => {
                        // Have to recast, like in https://stackoverflow.com/questions/42066421/property-value-does-not-exist-on-type-eventtarget
                        // (Not sure if the type is correct, but it contains value so it shouldn't really matter)
                        setConfigWithNewValue("elk_stress", props.stateField, "number_of_new_algorithm_runs", parseInt((e.target as HTMLInputElement).value));
                            }}></input>
                {config?.[props.stateField]?.elk_stress?.["number_of_new_algorithm_runs"]}
            </div>
            {interactiveCheckbox({...props, algorithmName: "elk_stress"})}
            <RunLayeredAfterCombobox stateField={props.stateField}></RunLayeredAfterCombobox>

        </div>;

    const LayeredConfig = (props: {stateField: MainOrGeneralType}) =>
        <div>
            <h1 className='font-black'>
                {props.stateField === "main" ? "Nastavení pro hlavní algoritmus" : "Nastavení pro generalizační vztahy"}
            </h1>
            <div className="flex flex-row">
                <label htmlFor={`${props.stateField}-main-alg-direction`}>Preferovaný směr hran: </label>
            </div>
            <div className="flex flex-row">
                <LayeredAlgorithmDirectionDropdown direction={config?.[props.stateField]?.["elk_layered"]?.["alg_direction"] ?? DIRECTION.DOWN} setDirection={(newDirection) => {
                            setConfigWithNewValue("elk_layered", props.stateField, "alg_direction", newDirection);
                            }}></LayeredAlgorithmDirectionDropdown>
            </div>

            {interactiveCheckbox({...props, algorithmName: "elk_layered"})}

            <div className="flex flex-row">
                { /* It has to be onMouseUp, if I put it onChange then react forces redraw and stops the "drag" event I guess */ }
                { /* TOOD: Rewrite like this or similar <ConfigSlider min={0} max={1000} step={10} configName='layer-gap' defaultValue={100} setConfig={setConfig}></ConfigSlider> */}
                <label htmlFor={`range-${props.stateField}-layer-gap`}>Prostor mezi vrstvami: </label>
            </div>
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id={`range-${props.stateField}-layer-gap`} draggable="false"
                        defaultValue={config?.[props.stateField]?.["elk_layered"]?.["layer_gap"]}
                        onMouseUp={(e) => {
                            setConfigWithNewValue("elk_layered", props.stateField, "layer_gap", parseInt((e.target as HTMLInputElement).value));
                        }}></input>
                {config?.[props.stateField]?.["elk_layered"]?.["layer_gap"]}
            </div>


            <div className="flex flex-row">
                 <label htmlFor={`range-${props.stateField}in-layer-gap`}>Prostor mezi třídami uvnitř vrstvy: </label>
            </div>
            <div className="flex flex-row ">
                <input type="range" min="0" max="1000" step="10" className="slider" id={`range-${props.stateField}-in-layer-gap`} draggable="false"
                        defaultValue={config?.[props.stateField]?.["elk_layered"]?.["in_layer_gap"]}
                        onMouseUp={(e) => {
                            setConfigWithNewValue("elk_layered", props.stateField, "in_layer_gap", parseInt((e.target as HTMLInputElement).value));
                                                }}></input>
                {config?.[props.stateField]?.["elk_layered"]?.["in_layer_gap"]}
            </div>
        </div>;

    const renderMainAlgorithmConfig = () => {
        // TODO: resetConfig is not it, the state has to be solved differently - different algorithms share non-relevant parameters, but it affects them
        //       (For example running layered after layered, because I checked it for stress layout)
        // resetConfig();
        if(config.main[config.chosenMainAlgorithm ] === undefined) {
            config.main[config.chosenMainAlgorithm ] = getDefaultMainUserGivenAlgorithmConstraint(config.chosenMainAlgorithm);
        }
        if(config.chosenMainAlgorithm === "elk_layered") {
            return <LayeredConfig stateField="main"></LayeredConfig>;
        }
        else if(config.chosenMainAlgorithm === "elk_stress") {
            return <StressConfig stateField="main"></StressConfig>;
        }
        else if(config.chosenMainAlgorithm === "elk_force") {
            return <ForceConfig stateField="main"></ForceConfig>;
        }
        else if(config.chosenMainAlgorithm === "elk_radial") {
            return <RadialConfig stateField="main"></RadialConfig>;
        }
        else {
            return null;
        }
    };


    const ConfigDialog = () =>
        <div>
            <div className="flex flex-row">
                <label htmlFor="main-layout-alg" className='font-black'>Hlavní layoutovací algoritmus: </label>
            </div>
            <div className="flex flex-row">
                <select id="main-layout-alg" value={config["chosenMainAlgorithm"]}
                        onChange={(event) => setConfig({...config,
                                                        "chosenMainAlgorithm": event.target.value as AlgorithmName
                                                        })
                                                    }>
                    <option value="elk_layered">Úrovňový</option>
                    <option value="elk_stress">Fyzikální (Stress)</option>
                    <option value="elk_force">Fyzikální (Force - Jen Debug)</option>
                    <option value="elk_radial">Radiální</option>
                    <option value="random">Náhodný</option>
                </select>
            </div>
            <div className='h-8'>------------------------</div>
            {renderMainAlgorithmConfig()}
            <div className='h-8'>------------------------</div>
            <input type="checkbox" id="checkbox-main-layout-alg" name="checkbox-main-layout-alg" checked={config.general.elk_layered.should_be_considered}
                    onChange={e => setConfig({...config,
                                              general: {
                                                ...config.general,
                                                elk_layered: {
                                                    ...config.general.elk_layered,
                                                    "should_be_considered": e.target.checked
                                                }
                                                 }})} />
            <label htmlFor="checkbox-main-layout-alg">Zpracuj generalizační vztahy zvlášť (Zatím ne moc funkční ... s fyzikálním téměř vůbec)</label>
            {config.general.elk_layered.should_be_considered === false ? null :
                <div>
                    <div className='h-2'></div>
                    <LayeredConfig stateField='general'></LayeredConfig>
                </div>
            }
        </div>;

    return {
        getValidConfig,
        ConfigDialog,
        resetConfig
    };
};
