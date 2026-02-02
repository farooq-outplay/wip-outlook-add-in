import * as React from "react";
import "./Header.css";
import { Navigation24Regular } from "@fluentui/react-icons";
import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
} from "@fluentui/react-components";
import MenuPanel from "../MenuPanel/MenuPanel";
import { OPAddInComponentType } from "../../../utility/types/ComponentTypes";
import ProspectDetails from "../ProspectDetails/ProspectDetails";
import { useAppContext } from "../../../utility/store/AppContext";

const TaskComponent = () => (
  <div style={{ padding: "20px", background: "#eee" }}>Task Component Content</div>
);

// Map enum to components
const componentMap: Record<OPAddInComponentType, React.ReactNode> = {
  [OPAddInComponentType.ProspectSectionComponent]: <ProspectDetails />,
  [OPAddInComponentType.TaskComponent]: <TaskComponent />,
};

const Header: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState<OPAddInComponentType | null>(
    OPAddInComponentType.ProspectSectionComponent
  );

  const handleMenuSelect = (component: OPAddInComponentType) => {
    setSelectedComponent(component);
    setOpen(false); // close drawer
  };

  return (
    <>
      <div className="header-container">
        <div className="logo-container">
          <img
            src="https://cdn.outplayhq.com/img/login-logo.png"
            alt="Outplay Logo"
            className="logo-image"
          />
        </div>

        <span className="menu-icon" onClick={() => setOpen(true)} role="button">
          <Navigation24Regular />
        </span>
      </div>

      <OverlayDrawer open={open} position="end" onOpenChange={(_, data) => setOpen(data.open)}>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button appearance="subtle" onClick={() => setOpen(false)}>
                ✕
              </Button>
            }
          >
            Quicklinks
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <MenuPanel onSelect={handleMenuSelect} onClose={() => setOpen(false)} />
        </DrawerBody>
      </OverlayDrawer>

      {/* Render component dynamically */}
      {selectedComponent && componentMap[selectedComponent]}
    </>
  );
};

export default Header;
