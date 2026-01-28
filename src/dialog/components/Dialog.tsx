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
} from "@fluentui/react-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./Dialog.css";


const Dialog: React.FC = () => {
  // Mock data
  const sequences = ["Outbound Sequence 1", "Follow-up Campaign", "Nurture Track"];
  const senders = ["deeksha.t@outplayhq.com (Default)", "sales@outplayhq.com"];
  const opportunities = ["Most recently updated open", "New Deal 2024", "Main Account Expansion"];

  // State
  const [selectedSequence, setSelectedSequence] = useState<string>("");
  const [selectedSender, setSelectedSender] = useState<string>(senders[0]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(opportunities[0]);

  // Handle Close
  const handleClose = () => {
    Office.context.ui.messageParent(JSON.stringify({ status: "closed" }));
  };

  // Handle Submit
  const handleSubmit = () => {
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
              placeholder="Search Sequences"
              className="dropdown-full-width"
              onOptionSelect={(_e, data) => setSelectedSequence(data.optionText || "")}
              value={selectedSequence}
              onChange={(e) => setSelectedSequence(e.target.value)}
            >
              {sequences.map((seq) => (
                <Option key={seq} text={seq}>
                  {seq}
                </Option>
              ))}
            </Combobox>
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
