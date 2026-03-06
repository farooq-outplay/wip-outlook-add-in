import React, { useState, useEffect } from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "./SendMessageDialog.css";

const SendMessageDialog: React.FC = () => {
    const [prospects, setProspects] = useState<string[]>([]);
    const [body, setBody] = useState("");

    // Read the prospectName from the URL parameters when the dialog loads
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get("prospectName");
        if (name && name.trim()) {
            setProspects([name.trim()]);
        }
    }, []);

    // Send a "closed" status back to the parent taskpane to close the dialog
    const handleClose = () => {
        Office.context.ui.messageParent(JSON.stringify({ status: "closed" }));
    };

    // Remove a prospect chip
    const removeProspect = (index: number) => {
        setProspects((prev) => prev.filter((_, i) => i !== index));
    };

    // Send a "submitted" status with data back to the parent taskpane
    const handleSend = () => {
        const payload = {
            status: "submitted",
            data: { prospects, body }
        };
        Office.context.ui.messageParent(JSON.stringify(payload));
    };

    return (
        <FluentProvider theme={webLightTheme}>
            <div className="sms-root">
                {/* Header */}
                <div className="sms-modal-header">
                    <h2 className="sms-modal-title" id="sms-modal-title">Send Message</h2>
                    <button className="sms-modal-close" onClick={handleClose} aria-label="Close">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="sms-modal-body">
                    {/* Prospects Field */}
                    <div className="sms-form-group">
                        <label className="sms-label">Prospects</label>
                        <div className="sms-prospects-field">
                            <div className="sms-prospects-chips">
                                {prospects.map((p, idx) => (
                                    <span key={idx} className="sms-prospect-chip">
                                        {p}
                                        <button
                                            className="sms-chip-remove"
                                            onClick={() => removeProspect(idx)}
                                            aria-label={`Remove ${p}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {prospects.length === 0 && (
                                    <span className="sms-prospects-placeholder">Select prospect</span>
                                )}
                            </div>
                            {prospects.length > 0 && (
                                <button
                                    className="sms-prospects-clear"
                                    onClick={() => setProspects([])}
                                    aria-label="Clear all prospects"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Send From Field */}
                    <div className="sms-form-group">
                        <label className="sms-label">Send From</label>
                        <div className="sms-send-from">
                            <span className="sms-send-from-icon">✈</span>
                            <span className="sms-send-from-number">+12512612805</span>
                            <span className="sms-send-from-chevron">▾</span>
                        </div>
                    </div>

                    {/* Body Field */}
                    <div className="sms-form-group">
                        <label className="sms-label">Body</label>
                        <textarea
                            className="sms-body-textarea"
                            placeholder="Enter Your SMS"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="sms-modal-footer">
                    <button className="sms-btn-cancel" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="sms-btn-send" onClick={handleSend}>
                        Send
                    </button>
                </div>
            </div>
        </FluentProvider>
    );
};

export default SendMessageDialog;
