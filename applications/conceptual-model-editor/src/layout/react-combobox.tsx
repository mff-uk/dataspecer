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
    // setSelectedOption(option);
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
          <div className="dropdown-item" onClick={() => handleOptionClick("UP")}>
            <TreeIcon direction="UP"></TreeIcon>
            UP
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("RIGHT")}>
            <TreeIcon direction="RIGHT"></TreeIcon>
            RIGHT
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("DOWN")}>
            <TreeIcon direction="DOWN"></TreeIcon>
            DOWN
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick("LEFT")}>
            <TreeIcon direction="LEFT"></TreeIcon>
            LEFT
          </div>
        </div>
      )}
    </div>
  );
};

export default LayeredAlgorithmDirectionDropdown;
