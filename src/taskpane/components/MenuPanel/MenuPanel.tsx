//MenuPanel.tsx
import React, { ComponentType } from "react";
import { Text, Button } from "@fluentui/react-components";
import { OPAddInComponentType } from "../../../utility/types/ComponentTypes";

interface Props {
  onClose: () => void;
}

interface MenuPanelProps {
  onClose: () => void;
  onSelect: (component: OPAddInComponentType) => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({ onClose, onSelect }) => {
  return (
    <div>
      <div
        onClick={() => onSelect(OPAddInComponentType.ProspectSectionComponent)}
        style={{ cursor: "pointer", padding: "10px" }}
      >
        Open Component A
      </div>
      <div
        onClick={() => onSelect(OPAddInComponentType.TaskComponent)}
        style={{ cursor: "pointer", padding: "10px" }}
      >
        Open Component B
      </div>
    </div>
  );
};

export default MenuPanel;
