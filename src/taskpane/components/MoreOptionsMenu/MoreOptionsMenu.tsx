import React, { useState, useRef, useEffect } from "react";
import { Button } from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import Tooltip from "../Tooltip/Tooltip";
import "./MoreOptionsMenu.css";

interface MoreOptionsMenuProps {
  onPause?: () => void;
  onMarkFinished?: () => void;
  onOptOut?: () => void;
  onDelete?: () => void;
  onLogCall?: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  onPause,
  onMarkFinished,
  onOptOut,
  onDelete,
  onLogCall,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (callback?: () => void) => {
    if (callback) callback();
    closeMenu();
  };

  return (
    <div className="more-options-container" ref={containerRef}>
      <Tooltip content="More Options">
        <Button
          appearance="subtle"
          icon={<MoreHorizontal20Regular />}
          className="trigger-button"
          onClick={toggleMenu}
          aria-label="More Options"
          aria-expanded={isOpen}
          aria-haspopup="true"
        />
      </Tooltip>

      {isOpen && (
        <div className="options-menu" role="menu">
          <button className="menu-item" onClick={() => handleAction(onPause)} role="menuitem">
            Pause
          </button>
          <button
            className="menu-item"
            onClick={() => handleAction(onMarkFinished)}
            role="menuitem"
          >
            Mark as Finished
          </button>
          <button className="menu-item" onClick={() => handleAction(onOptOut)} role="menuitem">
            Opt-out
          </button>
          <button className="menu-item" onClick={() => handleAction(onDelete)} role="menuitem">
            Delete
          </button>
          <button className="menu-item" onClick={() => handleAction(onLogCall)} role="menuitem">
            Log Call
          </button>
        </div>
      )}
    </div>
  );
};

export default MoreOptionsMenu;
