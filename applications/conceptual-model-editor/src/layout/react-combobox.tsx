import React, { useState } from "react";
import "./dropdown-styling.css";
import TreeIcon, { DirectionString } from "./TreeIcon";
import { Direction } from "@dataspecer/layout";

const LayeredAlgorithmDirectionDropdown = (props: {
  direction: Direction,
  setDirection: (direction: Direction) => void,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirection: DirectionString = Direction[props.direction];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: DirectionString) => {
    props.setDirection(Direction[option as keyof typeof Direction]);
    // SetSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        <div className="flex flex-row space-x-2">
          <div><TreeIcon direction={selectedDirection}></TreeIcon></div>
          <div>{selectedDirection}</div>
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-item" onClick={() => handleOptionClick("Up")}>
            <TreeIcon direction="Up"></TreeIcon>
            Up
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("Right")}>
            <TreeIcon direction="Right"></TreeIcon>
            Right
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("Down")}>
            <TreeIcon direction="Down"></TreeIcon>
            Down
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("Left")}>
            <TreeIcon direction="Left"></TreeIcon>
            Left
          </div>
        </div>
      )}
    </div>
  );
};

export default LayeredAlgorithmDirectionDropdown;
