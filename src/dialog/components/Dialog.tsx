/// <reference types="office-js" />
import React, { useState, useEffect } from "react";
import {
  Button,
  Combobox,
  Option,
  Dropdown,
  Label,
  FluentProvider,
  webLightTheme,
  Textarea,
} from "@fluentui/react-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Pause20Regular, CheckmarkCircle20Regular, Prohibited20Regular, Delete20Regular, Dismiss24Regular } from "@fluentui/react-icons";
import "./Dialog.css";

import { getSequences, Sequence } from "../../utility/api/sequenceService";

const Dialog: React.FC = () => {
  // Mock data
  // const sequences = ["Outbound Sequence 1", "Follow-up Campaign", "Nurture Track"];
  const senders = ["deeksha.t@outplayhq.com (Default)", "sales@outplayhq.com"];
  const opportunities = ["Most recently updated open", "New Deal 2024", "Main Account Expansion"];
  const dispositions = ["Connected", "Left Voicemail", "Busy", "Wrong Number"];

  // State
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoadingSequences, setIsLoadingSequences] = useState<boolean>(false);
  const [sequenceError, setSequenceError] = useState<string | null>(null);

  const [selectedSequence, setSelectedSequence] = useState<string>("");
  const [selectedSender, setSelectedSender] = useState<string>(senders[0]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(opportunities[0]);
  const [callNotes, setCallNotes] = useState<string>("");
  const [callDisposition, setCallDisposition] = useState<string>("Select");
  const [dialogType, setDialogType] = useState<string>("default");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type) {
      setDialogType(type);
    }

    // Fetch sequences
    if (!type || type === "default") {
      setIsLoadingSequences(true);
      setSequenceError(null);
      getSequences()
        .then((result) => {
          if (result.success) {
            setSequences(result.data);
          } else {
            setSequenceError(result.error || "Failed to load sequences");
          }
          setIsLoadingSequences(false);
        })
        .catch(() => {
          setSequenceError("An error occurred while fetching sequences");
          setIsLoadingSequences(false);
        });
    }
  }, []);

  // Handle Close
  const handleClose = () => {
    Office.context.ui.messageParent(JSON.stringify({ status: "closed" }));
  };

  // Handle Submit
  const handleSubmit = () => {
    if (dialogType === "pause") {
      Office.context.ui.messageParent(JSON.stringify({ status: "submitted", data: { action: "pause" } }));
      return;
    }
    if (dialogType === "markFinished") {
      Office.context.ui.messageParent(JSON.stringify({ status: "submitted", data: { action: "markFinished" } }));
      return;
    }
    if (dialogType === "optOut") {
      Office.context.ui.messageParent(JSON.stringify({ status: "submitted", data: { action: "optOut" } }));
      return;
    }
    if (dialogType === "delete") {
      Office.context.ui.messageParent(JSON.stringify({ status: "submitted", data: { action: "delete" } }));
      return;
    }
    if (dialogType === "logCall") {
      const payload = {
        status: "submitted",
        data: {
          action: "logCall",
          notes: callNotes,
          disposition: callDisposition,
          opportunity: selectedOpportunity
        }
      };
      Office.context.ui.messageParent(JSON.stringify(payload));
      return;
    }
    const payload = {
      status: "submitted",
      data: {
        sequence: selectedSequence,
        sender: selectedSender,
        opportunity: selectedOpportunity
      }
    };
    Office.context.ui.messageParent(JSON.stringify(payload));
  };

  if (dialogType === "pause") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-root pause-root">
          <div className="pause-modal-header">
            <div className="pause-icon-wrapper">
              <Pause20Regular />
            </div>
            <h3 className="pause-modal-title">Pause Prospect ?</h3>
          </div>
          <div className="pause-modal-body">
            Are you sure you want to pause this prospect from all active sequences?
          </div>
          <div className="pause-modal-footer">
            <button className="modal-btn modal-btn-secondary" onClick={handleClose}>
              No
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
              Yes
            </button>
          </div>
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "markFinished") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-root pause-root">
          <div className="pause-modal-header">
            <div className="pause-icon-wrapper finished-icon-wrapper">
              <CheckmarkCircle20Regular />
            </div>
            <h3 className="pause-modal-title">Mark Prospect as Finished ?</h3>
          </div>
          <div className="pause-modal-body">
            Are you sure you want to mark this prospect as finished from all active active sequences?
          </div>
          <div className="pause-modal-footer">
            <button className="modal-btn modal-btn-secondary" onClick={handleClose}>
              No
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
              Yes
            </button>
          </div>
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "optOut") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-root pause-root">
          <div className="pause-modal-header">
            <div className="pause-icon-wrapper optout-icon-wrapper">
              <Prohibited20Regular />
            </div>
            <h3 className="pause-modal-title">Optout Prospect ?</h3>
          </div>
          <div className="pause-modal-body">
            Are you sure you want to opt out this prospect?
          </div>
          <div className="pause-modal-footer">
            <button className="modal-btn modal-btn-secondary" onClick={handleClose}>
              No
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
              Yes
            </button>
          </div>
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "delete") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-root pause-root">
          <div className="pause-modal-header">
            <div className="pause-icon-wrapper delete-icon-wrapper">
              <Delete20Regular />
            </div>
            <h3 className="pause-modal-title">Delete Prospect ?</h3>
          </div>
          <div className="pause-modal-body">
            Are you sure you want to delete the Prospect?
          </div>
          <div className="pause-modal-footer">
            <button className="modal-btn modal-btn-secondary" onClick={handleClose}>
              No
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
              Yes
            </button>
          </div>
        </div>
      </FluentProvider>
    );

  }

  if (dialogType === "logCall") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-root">
          <div className="title-container">
            <div className="title-text" style={{ fontSize: "16px", fontWeight: 600 }}>
              Log Call
            </div>
            <div style={{ cursor: "pointer" }} onClick={handleClose}>
              <Dismiss24Regular />
            </div>
          </div>

          <div className="content-container">
            {/* Log Call Notes */}
            <div className="field-group">
              <Label className="field-label">Log Call</Label>
              <Textarea
                placeholder="Your call notes here"
                value={callNotes}
                onChange={(_e, data) => setCallNotes(data.value)}
                rows={4}
                style={{ minHeight: "80px" }}
              />
            </div>

            {/* Call Disposition */}
            <div className="field-group">
              <Label className="field-label">Call Disposition</Label>
              <Dropdown
                className="dropdown-full-width"
                placeholder="Select"
                value={callDisposition === "Select" ? undefined : callDisposition}
                onOptionSelect={(_e, data) => setCallDisposition(data.optionText || "")}
              >
                {dispositions.map((disp) => (
                  <Option key={disp} text={disp}>
                    {disp}
                  </Option>
                ))}
              </Dropdown>
            </div>

            {/* Select Opportunity */}
            <div className="field-group">
              <Label className="field-label">Select Opportunity</Label>
              <Dropdown
                className="dropdown-full-width"
                value={selectedOpportunity}
                onOptionSelect={(_e, data) => setSelectedOpportunity(data.optionText || "")}
              >
                <Option key="no-opp" text="No Opportunity">No Opportunity</Option>
                {opportunities.map((opp) => (
                  <Option key={opp} text={opp}>
                    {opp}
                  </Option>
                ))}
              </Dropdown>
            </div>
          </div>

          <div className="actions-container">
            <Button appearance="subtle" onClick={handleClose} className="cancel-button">
              Cancel
            </Button>
            <Button appearance="primary" className="submit-button" onClick={handleSubmit}>
              Log
            </Button>
          </div>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="dialog-root">
        {/* Header */}
        <div className="title-container">
          <div className="title-text">
            <div className="icon-container">
              <FontAwesomeIcon icon={faPaperPlane} className="icon-paperplane" />
            </div>
            Add to Sequence
          </div>
          {/* Only show close button if not in a dialog that has its own chrome, 
                        but standard is to handle inside content or rely on window frame. 
                        We keep it for consistency with design provided. */}

        </div>

        <div className="content-container">
          {/* Search Sequences */}
          <div className="field-group">
            <Combobox
              placeholder={isLoadingSequences ? "Loading sequences..." : "Search Sequences"}
              className="dropdown-full-width"
              onOptionSelect={(_e, data) => setSelectedSequence(data.optionText || "")}
              value={selectedSequence}
              onChange={(e) => setSelectedSequence(e.target.value)}
              disabled={isLoadingSequences}
            >
              {sequences.map((seq) => (
                <Option key={seq.id} text={seq.name}>
                  {seq.name}
                </Option>
              ))}
            </Combobox>
            {sequenceError && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{sequenceError}</div>}
            {!isLoadingSequences && !sequenceError && sequences.length === 0 && (
              <div style={{ color: "gray", fontSize: "12px", marginTop: "4px" }}>No sequences found</div>
            )}
          </div>

          {/* Send Email From */}
          <div className="field-group">
            <Label className="field-label">Send Email From</Label>
            <Dropdown
              className="dropdown-full-width"
              value={selectedSender}
              onOptionSelect={(_e, data) => setSelectedSender(data.optionText || "")}
            >
              {senders.map((sender) => (
                <Option key={sender} text={sender}>
                  {sender}
                </Option>
              ))}
            </Dropdown>
          </div>

          {/* Select Opportunity */}
          <div className="field-group">
            <Label className="field-label">Select Opportunity</Label>
            <Dropdown
              className="dropdown-full-width"
              value={selectedOpportunity}
              onOptionSelect={(_e, data) => setSelectedOpportunity(data.optionText || "")}
            >
              {opportunities.map((opp) => (
                <Option key={opp} text={opp}>
                  {opp}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>

        <div className="actions-container">
          <Button appearance="subtle" onClick={handleClose} className="cancel-button">
            Cancel
          </Button>
          <Button appearance="primary" className="submit-button" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </FluentProvider>
  );
};

export default Dialog;
