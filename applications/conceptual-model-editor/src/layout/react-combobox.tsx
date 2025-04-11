import { useState } from "react";
import "./dropdown-styling.css";
import TreeIcon from "./TreeIcon";
import { Direction } from "@dataspecer/layout";

function capitalizeFirst(direction: Direction): string {
  return direction.charAt(0).toUpperCase() + direction.slice(1).toLowerCase();
}

const LayeredAlgorithmDirectionDropdown = (props: {
  direction: Direction,
  setDirection: (direction: Direction) => void,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (direction: Direction) => {
    props.setDirection(direction);
    setIsOpen(false);
  };

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        <div className="flex flex-row space-x-2">
          <div><TreeIcon direction={props.direction}></TreeIcon></div>
          <div>{capitalizeFirst(props.direction)}</div>
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-item" onClick={() => handleOptionClick(Direction.Up)}>
            <TreeIcon direction={Direction.Up}></TreeIcon>
            Up
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick(Direction.Right)}>
            <TreeIcon direction={Direction.Right}></TreeIcon>
            Right
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick(Direction.Down)}>
            <TreeIcon direction={Direction.Down}></TreeIcon>
            Down
          </div>
          <div className="dropdown-item" onClick={() => handleOptionClick(Direction.Left)}>
            <TreeIcon direction={Direction.Left}></TreeIcon>
            Left
          </div>
        </div>
      )}
    </div>
  );
};

export default LayeredAlgorithmDirectionDropdown;
