import { useState } from 'react';
import { IConstraintSimple } from '@dataspecer/layout';


enum DIRECTION { 
    UP = "UP", 
    RIGHT = "RIGHT", 
    DOWN = "DOWN", 
    LEFT = "LEFT"
}


// TODO: Awful
// 1) Make it more general - a lot of repeating code and the same strings on multiple of places (create new react components or something)
// 2) Make it map to the Constraint interface (and pass only the relevant settings further) ... and better typing - kinda done
// 3) Style it better - but it is kind of throwaway so it doesn't really matter
// 4) Have language strings, etc.
export const useConfigDialog = () => {
    const [config, setConfig] = useState({"init": "init", "main-layout-alg": "stress", 
//                                            "profile-nodes-position-against-source": DIRECTION.DOWN,
                                            "main-alg-direction": DIRECTION.UP,
                                            "layer-gap": 100,
                                            "in-layer-gap": 100,                                            
                                        
                                            "stress-edge-len": 600,

                                            "min-distance-between-nodes": 100,
                                            "force-alg-type": "FRUCHTERMAN_REINGOLD",
                                        
                                            "process-general-separately": false,
                                            "general-main-alg-direction": DIRECTION.UP,
                                            "general-layer-gap": 100,
                                            "general-in-layer-gap": 100,

                                            "double-run": true,
                                        });    

    // const updateConfig = (key: string, e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    //     setConfig({...config, [key]: parseInt(e.target.value)});
    // }


    // TODO: I think that there should be way to make it less error prone (put the relevant configs to components and pick it from them or something)
    const getValidConfig = () => {
        if(config['main-layout-alg'] === "random") {
            return {
                'main-alg-config': {
                    "constraintedNodes": "ALL",
                    "data": {
                        "main-layout-alg": config['main-layout-alg']                        
                    }
                }
            };
        }   
        let validConfig: Record<string, IConstraintSimple> = {};
        if(config['main-layout-alg'] === "stress") {
            validConfig = {
                'main-alg-config': {
                    "constraintedNodes": "ALL",
                    "data": {
                        "main-layout-alg": config['main-layout-alg'],
                        "stress-edge-len": config['stress-edge-len']
                    }
                }
            };
        }
        else if(config['main-layout-alg'] === "force") {
            validConfig = {
                'main-alg-config': {
                    "constraintedNodes": "ALL",
                    "data": {
                        "main-layout-alg": config['main-layout-alg'],
                        "min-distance-between-nodes": config['min-distance-between-nodes'],
                        "force-alg-type": config['force-alg-type'],
                    }
                }
            };
        }
        else {
            validConfig = {
                'main-alg-config': {
                    "constraintedNodes": "ALL",
                    "data": {
                        "main-layout-alg": config['main-layout-alg'],
                        "main-alg-direction": config["main-alg-direction"],
                        "layer-gap": config["layer-gap"],
                        "in-layer-gap": config["in-layer-gap"],
                    }
                }
            };
        }

        if(config['process-general-separately']) {
            validConfig = {
                ...validConfig,
                'general-config': {
                    "constraintedNodes": "GENERALIZATION",
                    "data": {
                        "main-layout-alg": "layered",       // TODO: Just fix it for now (layered is usually the best choice for generalization hierarchy anyways)
                        "general-main-alg-direction": config['general-main-alg-direction'],
                        "general-layer-gap": config['general-layer-gap'],
                        "general-in-layer-gap": config['general-in-layer-gap'],                        
                    }
                }
            };
            
            if(config["double-run"]) {
                validConfig = {
                    ...validConfig,
                    'general-config-double-run': {
                        "constraintedNodes": "GENERALIZATION",
                        "data": {
                            "double-run": config["double-run"],
                        }
                    }
                }
            }
        }

        return validConfig;
    }

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


    const ForceConfig = () =>
        <div>
            <h1 className='font-black'>Nastavení fyzikálního modelu</h1>
            <div className="flex flex-row">
                <label htmlFor="range-min-distance-between-nodes">Min vzdálenost mezi vrcholy: </label>
            </div> 
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id="range-min-distance-between-nodes" draggable="false" 
                        defaultValue={config["min-distance-between-nodes"]} 
                        onMouseUp={(e) => { setConfig({...config, "min-distance-between-nodes": parseInt((e.target as HTMLInputElement).value)});}}></input>
                        {/* Have to recast, like in https://stackoverflow.com/questions/42066421/property-value-does-not-exist-on-type-eventtarget 
                            (Not sure if the type is correct, but it contains value so it shouldn't really matter) */}
                {config["min-distance-between-nodes"]}
            </div>


            <div className="flex flex-row">
                <label htmlFor="force-alg-type">Typ výpočtu: </label>
            </div> 
            <div className="flex flex-row">
                <select id="force-alg-type" value={config["force-alg-type"]} onChange={(event) => {
                                // Based on https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
                                setConfig({...config, ["force-alg-type"]: event.target.value });        
                    }}>
                    <option value="EADES">Eades</option>
                    <option value="FRUCHTERMAN_REINGOLD">Fruchterman Reingold</option>
                </select>
            </div> 
        </div>

    const StressConfig = () => 
        <div>
            <h1 className='font-black'>Nastavení fyzikálního modelu</h1>
            <div className="flex flex-row">
                <label htmlFor="range-stress-edge-len">Ideální délka hran: </label>
            </div> 
            <div className="flex flex-row">
                <input type="range" min="0" max="1000" step="10" className="slider" id="range-stress-edge-len" draggable="false" 
                        defaultValue={config['stress-edge-len']} 
                        onMouseUp={(e) => { setConfig({...config, "stress-edge-len": parseInt((e.target as HTMLInputElement).value)});}}></input>
                        {/* Have to recast, like in https://stackoverflow.com/questions/42066421/property-value-does-not-exist-on-type-eventtarget 
                            (Not sure if the type is correct, but it contains value so it shouldn't really matter) */}
                {config["stress-edge-len"]}
            </div>
        </div>


    const LayeredConfig = (props: {idPrefix: "" | "general-"}) => 
        <div>
            <h1 className='font-black'>
                {props.idPrefix === "" ? "Nastavení pro hlavní algoritmus" : "Nastavení pro generalizační vztahy"}
            </h1>
            <div className="flex flex-row">
                <label htmlFor={`${props.idPrefix}main-alg-direction`}>Preferovaný směr hran: </label>
            </div> 
            <div className="flex flex-row">
                <select id={`${props.idPrefix}main-alg-direction`} value={config[`${props.idPrefix}main-alg-direction`]} onChange={(event) => {
                                // Based on https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
                                setConfig({...config, [`${props.idPrefix}main-alg-direction`]: DIRECTION[event.target.value as keyof typeof DIRECTION] });        
                    }}>
                    <option value="UP">Nahoru</option>
                    <option value="RIGHT">Doprava</option>
                    <option value="DOWN">Dolu</option>
                    <option value="LEFT">Doleva</option>
                </select>
            </div>            
    
            <div className="flex flex-row">
                { /* It has to be onMouseUp, if I put it onChange then react forces redraw and stops the "drag" event I guess */ }
                { /* TOOD: Rewrite like this or similar <ConfigSlider min={0} max={1000} step={10} configName='layer-gap' defaultValue={100} setConfig={setConfig}></ConfigSlider> */}
                <label htmlFor={`range-${props.idPrefix}layer-gap`}>Prostor mezi vrstvami: </label>
            </div>
            <div className="flex flex-row">    
                <input type="range" min="0" max="1000" step="10" className="slider" id={`range-${props.idPrefix}layer-gap`} draggable="false" 
                        defaultValue={config[`${props.idPrefix}layer-gap`]} 
                        onMouseUp={(e) => { setConfig({...config, [`${props.idPrefix}layer-gap`]: parseInt((e.target as HTMLInputElement).value)});}}></input>
                {config[`${props.idPrefix}layer-gap`]}
            </div>
            

            <div className="flex flex-row">
                 <label htmlFor={`range-${props.idPrefix}in-layer-gap`}>Prostor mezi třídami uvnitř vrstvy: </label>
             </div>
             <div className="flex flex-row ">
                 <input type="range" min="0" max="1000" step="10" className="slider" id={`range-${props.idPrefix}in-layer-gap`} draggable="false" 
                        defaultValue={config[`${props.idPrefix}in-layer-gap`]} 
                        onMouseUp={(e) => { setConfig({...config, [`${props.idPrefix}in-layer-gap`]: parseInt((e.target as HTMLInputElement).value)});}}>
                </input>            
                {config[`${props.idPrefix}in-layer-gap`]}
            </div>
            { props.idPrefix !== "general-" ? null : 
                    <div>
                        <input type="checkbox" id="checkbox-double-run" name="checkbox-double-run" checked={config['double-run']} 
                                 onChange={e => setConfig({...config, "double-run": e.target.checked })} />
                        <label htmlFor="checkbox-double-run">Spusť dva běhy</label>
                    </div>
                
            }
        </div>

    const renderMainAlgorithmConfig = () => {
        if(config['main-layout-alg'] === "layered") {
            return <LayeredConfig idPrefix=''></LayeredConfig>;
        }
        else if(config['main-layout-alg'] === "stress") {
            return <StressConfig></StressConfig>;
        }
        else if(config['main-layout-alg'] === "force") {
            return <ForceConfig></ForceConfig>;
        }
        else {
            return null;
        }
    }


    const ConfigDialog = () =>   
        <div>
            <div className="flex flex-row">
                <label htmlFor="main-layout-alg" className='font-black'>Hlavní layoutovací algoritmus: </label>
            </div>    
            <div className="flex flex-row">
                <select id="main-layout-alg" value={config['main-layout-alg']} 
                        onChange={(event) => setConfig({...config, "main-layout-alg": event.target.value })}>
                    <option value="layered">Úrovňový</option>
                    <option value="stress">Fyzikální (Stress)</option>
                    <option value="force">Fyzikální (Force - Jen Debug)</option>
                    <option value="random">Náhodný</option>
                </select>
            </div>            
            <div className='h-8'>------------------------</div> 
            {renderMainAlgorithmConfig()}    
            <div className='h-8'>------------------------</div> 
            <input type="checkbox" id="checkbox-main-layout-alg" name="checkbox-main-layout-alg" checked={config['process-general-separately']} 
                    onChange={e => setConfig({...config, "process-general-separately": e.target.checked })} />
            <label htmlFor="checkbox-main-layout-alg">Zpracuj generalizační vztahy zvlášť (Zatím ne moc funkční ... s fyzikálním téměř vůbec)</label>            
            {config['process-general-separately'] === false ? null : 
                <div>
                    <div className='h-2'></div>                  
                    <LayeredConfig idPrefix='general-'></LayeredConfig>
                </div>
            }
        </div>

    return {
        getValidConfig,
        ConfigDialog
    };
}