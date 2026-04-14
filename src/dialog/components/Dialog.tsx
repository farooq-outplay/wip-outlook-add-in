/// <reference types="office-js" />
import React, { useState, useEffect, useRef } from "react";
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
import { getSenders, Sender } from "../../utility/api/senderService";
import { getAuthSession } from "../../utility/authSession";
import { getCallOutcomes } from "../../utility/api/taskService";

const Dialog: React.FC = () => {
  // Mock data
  // const sequences = ["Outbound Sequence 1", "Follow-up Campaign", "Nurture Track"];
  const opportunities = ["Most recently updated open", "New Deal 2024", "Main Account Expansion"];

  // State
  const [sequences, setSequences] = useState<any[]>([]);
  const [isLoadingSequences, setIsLoadingSequences] = useState<boolean>(false);
  const [sequenceError, setSequenceError] = useState<string | null>(null);

  const MOCK_SEQUENCES = [
    { id:"1", name:"New Sequence",                   team:false },
    { id:"2", name:"testauto",                       team:false },
    { id:"3", name:"auto",                           team:false },
    { id:"4", name:"test2",                          team:false },
    { id:"5", name:"Test",                           team:false },
    { id:"6", name:"ICP_24_Default_Sequence_4I",     team:true  },
    { id:"7", name:"ICP_24_VP_&_Directors_Sequence", team:true  },
  ];

  const [selectedSequence, setSelectedSequence] = useState<string>("");
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isLoadingSenders, setIsLoadingSenders] = useState<boolean>(false);
  const [selectedSender, setSelectedSender] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(opportunities[0]);
  const [callNotes, setCallNotes] = useState<string>("");
  const [callDisposition, setCallDisposition] = useState<string>("Select");
  const [callOutcomes, setCallOutcomes] = useState<any[]>([]);
  const [dialogType, setDialogType] = useState<string>("default");

  // Custom Sequence Dropdown State
  const [isSeqOpen, setIsSeqOpen] = useState<boolean>(false);
  const [seqSearch, setSeqSearch] = useState<string>("");
  const seqDropdownRef = useRef<HTMLDivElement>(null);

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
      // Use Mock Data instead of API
      setTimeout(() => {
        setSequences(MOCK_SEQUENCES);
        setIsLoadingSequences(false);
      }, 200);

      // Fetch senders
      setIsLoadingSenders(true);
      const authSession = getAuthSession();
      const userId = authSession?.userId || authSession?.email || Office.context.mailbox?.userProfile?.emailAddress;

      if (userId) {
        getSenders(userId)
          .then((result) => {
            if (result.success && result.data) {
              setSenders(result.data);
              const defaultSender = result.data.find(s => s.isDefault);
              if (defaultSender) {
                setSelectedSender(defaultSender.email);
              }
            }
            setIsLoadingSenders(false);
          })
          .catch(() => {
            setIsLoadingSenders(false);
          });
      } else {
        setIsLoadingSenders(false);
      }
    }

    if (type === "logCall") {
      getCallOutcomes()
        .then((res) => {
          if (res && res.success && res.data) {
             const data = res.data;
             const list = Array.isArray(data) ? data : (data.outcomes || data.data || []);
             setCallOutcomes(list);
          } else if (Array.isArray(res)) {
            setCallOutcomes(res);
          }
        })
        .catch((err) => console.error("Failed to load call outcomes", err));
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (seqDropdownRef.current && !seqDropdownRef.current.contains(e.target as Node)) {
        setIsSeqOpen(false);
      }
    };
    if (isSeqOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSeqOpen]);

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
        <div className="dialog-wrapper">
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
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "markFinished") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-wrapper">
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
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "optOut") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-wrapper">
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
        </div>
      </FluentProvider>
    );
  }

  if (dialogType === "delete") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-wrapper">
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
        </div>
      </FluentProvider>
    );

  }

  if (dialogType === "logCall") {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className="dialog-wrapper">
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
                {callOutcomes.map((disp, idx) => {
                  const text = typeof disp === "string" ? disp : (disp.name || disp.label || disp.value || disp.outcome || "Unknown");
                  const key = typeof disp === "string" ? disp : (disp.id || disp.guid || idx);
                  return (
                    <Option key={String(key)} text={String(text)}>
                      {String(text)}
                    </Option>
                  );
                })}
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
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="dialog-wrapper">
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
          {/* Custom Search Sequences Dropdown */}
          <div className="field-group" ref={seqDropdownRef}>
            <div className="seq-wrap">
              <button 
                className={`seq-trigger ${isSeqOpen ? "active" : ""}`}
                onClick={() => setIsSeqOpen(!isSeqOpen)}
                disabled={isLoadingSequences}
                type="button"
              >
                <span className="trigger-left">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 8l3-3-3-3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="5" y1="8" x2="15" y2="8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className={`trigger-text ${selectedSequence ? "selected-val" : "placeholder"}`}>
                    {isLoadingSequences ? "Loading sequences..." : (selectedSequence ? selectedSequence : "Search Sequences")}
                  </span>
                </span>
                <span className="chevron">
                  <svg viewBox="0 0 16 16" fill="none" width="15" height="15" style={{ display: "block" }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>

              <div className={`seq-panel ${isSeqOpen ? "open" : ""}`}>
                <div className="search-row">
                  <svg viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search Sequences" 
                    value={seqSearch}
                    onChange={(e) => setSeqSearch(e.target.value)}
                    autoFocus={isSeqOpen}
                  />
                </div>

                <div className="seq-list">
                  {sequences.filter(s => !s.team && s.name.toLowerCase().includes(seqSearch.toLowerCase())).length > 0 && (
                    <>
                      <div className="sec-hdr">
                        <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.8" stroke="#9ca3af" strokeWidth="1.3"/><path d="M2 15c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/></svg>
                        Me
                      </div>
                      {sequences
                        .filter(s => !s.team && s.name.toLowerCase().includes(seqSearch.toLowerCase()))
                        .map(seq => (
                          <div 
                            key={seq.id} 
                            className={`seq-item ${selectedSequence === seq.name ? "active" : ""}`}
                            onClick={() => {
                              setSelectedSequence(seq.name);
                              setIsSeqOpen(false);
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M2 8l3-3-3-3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="5" y1="8" x2="15" y2="8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span className="seq-item-name">{seq.name}</span>
                          </div>
                      ))}
                    </>
                  )}

                  {sequences.filter(s => s.team && s.name.toLowerCase().includes(seqSearch.toLowerCase())).length > 0 && (
                    <>
                      <div className="sec-hdr">
                        <svg viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.8" stroke="#9ca3af" strokeWidth="1.3"/><path d="M2 16c0-3 2-4.5 5-4.5s5 1.5 5 4.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/><circle cx="14.5" cy="7" r="2.2" stroke="#9ca3af" strokeWidth="1.2"/><path d="M17.5 16c0-2.2-1.3-3.5-3-3.5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Team
                      </div>
                      {sequences
                        .filter(s => s.team && s.name.toLowerCase().includes(seqSearch.toLowerCase()))
                        .map(seq => (
                          <div 
                            key={seq.id} 
                            className={`seq-item ${selectedSequence === seq.name ? "active" : ""}`}
                            onClick={() => {
                              setSelectedSequence(seq.name);
                              setIsSeqOpen(false);
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M2 8l3-3-3-3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="5" y1="8" x2="15" y2="8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span className="seq-item-name">{seq.name}</span>
                            <span className="team-badge" style={{ flexShrink: 0, opacity: 0.45 }}>
                              <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                                <circle cx="7" cy="7" r="2.8" stroke="#9ca3af" strokeWidth="1.3"/>
                                <path d="M2 16c0-3 2-4.5 5-4.5s5 1.5 5 4.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/>
                                <circle cx="14.5" cy="7" r="2.2" stroke="#9ca3af" strokeWidth="1.2"/>
                                <path d="M17.5 16c0-2.2-1.3-3.5-3-3.5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
                              </svg>
                            </span>
                          </div>
                      ))}
                    </>
                  )}

                  {sequences.filter(s => s.name.toLowerCase().includes(seqSearch.toLowerCase())).length === 0 && (
                    <div className="empty">No sequences found</div>
                  )}
                </div>
              </div>
            </div>
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
              placeholder={isLoadingSenders ? "Loading..." : "Select sender"}
              disabled={isLoadingSenders}
              onOptionSelect={(_e, data) => setSelectedSender(data.optionText || "")}
            >
              {senders.map((sender) => (
                <Option key={sender.id} text={sender.email}>
                  {sender.email}{sender.isDefault ? " (Default)" : ""}
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
      </div>
    </FluentProvider>
  );
};

export default Dialog;
