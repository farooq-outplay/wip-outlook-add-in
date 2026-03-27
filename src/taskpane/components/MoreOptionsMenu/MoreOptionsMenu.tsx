import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { pauseProspect, markAsFinishedProspect, optOutProspect, optInProspect, deleteProspect } from "../../../utility/api/prospectService";
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
  prospectId?: number;
  isOptedOut?: boolean;
  onPause?: () => void;
  onMarkFinished?: () => void;
  onOptOut?: () => void;
  onOptStatusChange?: (optedOut: boolean) => void;
  onDelete?: () => void;
  onLogCall?: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  prospectId,
  isOptedOut,
  onPause,
  onMarkFinished,
  onOptOut,
  onOptStatusChange,
  onDelete,
  onLogCall,
}) => {
  const [optedOut, setOptedOut] = useState<boolean>(isOptedOut ?? false);

  useEffect(() => {
    if (isOptedOut !== undefined) {
      setOptedOut(isOptedOut);
    }
  }, [isOptedOut]);

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
      handlePauseApiCall();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "markFinished") {
      handleMarkFinishedApiCall();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "optOut") {
      handleOptOutApiCall();
      dialogRef.current?.close();
      dialogRef.current = null;
    } else if (message.status === "submitted" && message.data?.action === "delete") {
      handleDeleteApiCall();
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

  const handlePauseApiCall = async () => {
    if (!prospectId) {
      toast.error("Prospect ID is missing.");
      return;
    }
    try {
      const res = await pauseProspect({ prospectId });
      const payload = res?.success === true ? res.data : res;

      if (payload && payload.success === true) {
        toast.success("Prospect paused successfully");
        if (onPause) onPause();
      } else {
        const errorMessage =
          payload && payload.errors && payload.errors.length > 0
            ? payload.errors[0].message
            : "Failed to pause prospect";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while pausing.");
    }
  };

  const handleMarkFinishedApiCall = async () => {
    if (!prospectId) {
      toast.error("Prospect ID is missing.");
      return;
    }
    try {
      const res = await markAsFinishedProspect({ prospectId });
      const payload = res?.success === true ? res.data : res;

      if (payload && payload.success === true) {
        toast.success("Prospect marked as finished successfully");
        if (onMarkFinished) onMarkFinished();
      } else {
        const errorMessage =
          payload && payload.errors && payload.errors.length > 0
            ? payload.errors[0].message
            : "Failed to mark prospect as finished";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while marking as finished.");
    }
  };

  const handleOptOutApiCall = async () => {
    if (!prospectId) {
      toast.error("Prospect ID is missing.");
      return;
    }
    try {
      const res = await optOutProspect({ prospectid: prospectId });
      const payload = res?.success === true ? res.data : res;

      if (payload && payload.success === true) {
        toast.success("Prospect opted-out successfully");
        setOptedOut(true);
        if (onOptOut) onOptOut();
        if (onOptStatusChange) onOptStatusChange(true);
      } else {
        const errorMessage =
          payload && payload.errors && payload.errors.length > 0
            ? payload.errors[0].message
            : "Failed to opt-out prospect";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while opting out.");
    }
  };

  const handleOptInClick = async () => {
    if (!prospectId) {
      toast.error("Prospect ID is missing.");
      return;
    }
    try {
      const res = await optInProspect({ prospectid: prospectId });
      const payload = res?.success === true ? res.data : res;

      if (payload && payload.success === true) {
        toast.success("Prospect opted-in successfully");
        setOptedOut(false);
        if (onOptStatusChange) onOptStatusChange(false);
      } else {
        const errorMessage =
          payload && payload.errors && payload.errors.length > 0
            ? payload.errors[0].message
            : "Failed to opt-in prospect";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while opting in.");
    }
  };

  const handleDeleteApiCall = async () => {
    if (!prospectId) {
      toast.error("Prospect ID is missing.");
      return;
    }
    try {
      const res = await deleteProspect({ prospectId });
      const payload = res?.success === true ? res.data : res;

      if (payload && payload.success === true) {
        toast.success("Prospect deleted successfully.");
        if (onDelete) onDelete();
      } else {
        const errorMessage =
          payload && payload.errors && payload.errors.length > 0
            ? payload.errors[0].message
            : "Failed to delete prospect";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while deleting.");
    }
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
            {optedOut ? (
              <MenuItem onClick={handleOptInClick}>Opt-in</MenuItem>
            ) : (
              <MenuItem onClick={handleOptOutClick}>Opt-out</MenuItem>
            )}
            <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
            <MenuItem onClick={handleLogCallClick}>Log Call</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default MoreOptionsMenu;
