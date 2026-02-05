import React, { useState, useRef, useEffect } from "react";
import { Button } from "@fluentui/react-components";
import { MoreHorizontal20Regular, Pause20Regular } from "@fluentui/react-icons";
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
  const dialogRef = useRef<Office.Dialog | null>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const handlePauseClick = () => {
    closeMenu();
    const url = new URL("/dialog.html?type=pause", window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height: 40, width: 30, displayInIframe: true },
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

  const handleMarkFinishedClick = () => {
    closeMenu();
    const url = new URL("/dialog.html?type=markFinished", window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height: 40, width: 30, displayInIframe: true },
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

  const handleOptOutClick = () => {
    closeMenu();
    const url = new URL("/dialog.html?type=optOut", window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height: 40, width: 30, displayInIframe: true },
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

  const handleDeleteClick = () => {
    closeMenu();
    const url = new URL("/dialog.html?type=delete", window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height: 40, width: 30, displayInIframe: true },
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

  const handleLogCallClick = () => {
    closeMenu();
    const url = new URL("/dialog.html?type=logCall", window.location.origin).toString();

    Office.context.ui.displayDialogAsync(
      url,
      { height: 60, width: 40, displayInIframe: true },
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
          <button
            className="menu-item"
            onClick={handlePauseClick}
            role="menuitem"
          >
            Pause
          </button>
          <button
            className="menu-item"
            onClick={handleMarkFinishedClick}
            role="menuitem"
          >
            Mark as Finished
          </button>
          <button
            className="menu-item"
            onClick={handleOptOutClick}
            role="menuitem"
          >
            Opt-out
          </button>
          <button
            className="menu-item"
            onClick={handleDeleteClick}
            role="menuitem"
          >
            Delete
          </button>
          <button
            className="menu-item"
            onClick={handleLogCallClick}
            role="menuitem"
          >
            Log Call
          </button>
        </div>
      )}

    </div >
  );
};

export default MoreOptionsMenu;
