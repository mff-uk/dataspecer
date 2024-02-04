import { useState } from "react";
import { ColorPalette, tailwindColorToHex } from "../../utils/color-utils";

export const ColorPicker = (props: { currentColor: string; saveColor: (color: string) => void }) => {
    const { currentColor, saveColor } = props;
    const [isOpen, setIsOpen] = useState(false);

    const numCols = 5;
    const colors = Object.keys(ColorPalette);
    let numRows = Math.floor(colors.length / numCols);
    const lastRowLength = colors.length % numCols;
    if (lastRowLength > 0) {
        numRows += 1;
    }

    if (!isOpen) {
        return (
            <div
                className="h-6 w-6 border-2 border-white"
                style={{ backgroundColor: tailwindColorToHex(currentColor) }}
                onClick={() => setIsOpen(true)}
            ></div>
        );
    } else {
        return (
            <div className="grid min-w-fit grid-cols-5 border-2 border-white p-1">
                {colors.map((tailwindColor) => {
                    const color = tailwindColorToHex(tailwindColor);
                    return (
                        <div
                            key={`color-${tailwindColor}`}
                            className={"h-6 w-6"}
                            style={{
                                backgroundColor: color,
                                border: color == currentColor ? "solid white 2px" : undefined,
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                saveColor(color);
                                setIsOpen(false);
                            }}
                        ></div>
                    );
                })}
            </div>
        );
    }
};
