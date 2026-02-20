import React, { useRef } from "react";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Tooltip,
} from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
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
  const dialogRef = useRef<Office.Dialog | null>(null);

  const processMessage = (arg: any) => {
    let message;
    try {
      message = JSON.parse(arg.message);
    } catch (e) {
      message = arg.message;
    }

    if (message.status === "closed") {
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "pause") {
      if (onPause) onPause();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "markFinished") {
      if (onMarkFinished) onMarkFinished();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "optOut") {
      if (onOptOut) onOptOut();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "delete") {
      if (onDelete) onDelete();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "logCall") {
      if (onLogCall) onLogCall();
      dialogRef.current?.close();
      dialogRef.current = null;
    }
  };

  const openDialog = (type: string, width: number, height: number) => {
    const url = new URL(`/dialog.html?type=${type}`, window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height, width, displayInIframe: true },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error(asyncResult.error.message);
        } else {
          dialogRef.current = asyncResult.value;
          dialogRef.current.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
          dialogRef.current.addEventHandler(Office.EventType.DialogEventReceived, (arg: any) => {
            if (arg.error === 12006) {
              dialogRef.current = null;
            }
          });
        }
      }
    );
  };

  const handlePauseClick = () => openDialog("pause", 30, 40);
  const handleMarkFinishedClick = () => openDialog("markFinished", 30, 40);
  const handleOptOutClick = () => openDialog("optOut", 30, 40);
  const handleDeleteClick = () => openDialog("delete", 30, 40);
  const handleLogCallClick = () => openDialog("logCall", 40, 60);

  return (
    <div className="more-options-container">
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Tooltip content="More Options" relationship="label">
            <Button
              appearance="subtle"
              icon={<MoreHorizontal20Regular />}
              className="trigger-button"
              aria-label="More Options"
            />
          </Tooltip>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem onClick={handlePauseClick}>Pause</MenuItem>
            <MenuItem onClick={handleMarkFinishedClick}>Mark as Finished</MenuItem>
            <MenuItem onClick={handleOptOutClick}>Opt-out</MenuItem>
            <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
            <MenuItem onClick={handleLogCallClick}>Log Call</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default MoreOptionsMenu;
