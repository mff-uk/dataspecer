import { useState } from "react";
import { ColorPalette, tailwindColorToHex } from "../../utils/color-utils";

const NUMBER_COLS = 5;

export const ColorPicker = (props: { currentColor: string; saveColor: (color: string) => void }) => {
    const { currentColor, saveColor } = props;
    const [isOpen, setIsOpen] = useState(false);

    const colors = Object.keys(ColorPalette);
    let numRows = Math.floor(colors.length / NUMBER_COLS);
    const lastRowLength = colors.length % NUMBER_COLS;
    if (lastRowLength > 0) {
        numRows += 1;
    }

    if (!isOpen) {
        return (
            <button
                title="choose new color"
                className="h-6 w-6 border-2 border-white"
                style={{ backgroundColor: tailwindColorToHex(currentColor) }}
                onClick={() => setIsOpen(true)}
            ></button>
        );
    } else {
        return (
            <button
                className="grid min-w-fit grid-cols-5 border-2 border-white p-1"
                onBlur={(e) => {
                    if (e.relatedTarget?.id.startsWith("button-color-picker-")) {
                        return;
                    }
                    console.log("color picker on blr", e);
                    setIsOpen(false);
                }}
            >
                {colors.map((tailwindColor) => {
                    const color = tailwindColorToHex(tailwindColor);
                    return (
                        <button
                            id={`button-color-picker-${tailwindColor}`}
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
                        ></button>
                    );
                })}
            </button>
        );
    }
};
