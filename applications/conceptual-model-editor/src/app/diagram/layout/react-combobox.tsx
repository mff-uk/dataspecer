import React, { useState } from "react";
import "./dropdown-styling.css";
import TreeIcon, { DIRECTION_STRING } from "./TreeIcon";
import { DIRECTION } from "../../../../../../packages/layout/lib/util/utils";

const LayeredAlgorithmDirectionDropdown = (props: {
  direction: DIRECTION,
  setDirection: (direction: DIRECTION) => void,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirection: DIRECTION_STRING = DIRECTION[props.direction];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: DIRECTION_STRING) => {
    props.setDirection(DIRECTION[option as keyof typeof DIRECTION]);
    // setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        <div className="flex flex-row">
        <TreeIcon direction={selectedDirection}></TreeIcon>
        {selectedDirection}
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
