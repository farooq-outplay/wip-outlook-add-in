import React, { useState, useEffect } from "react";
import {
    FluentProvider,
    webLightTheme,
    Toaster,
    useToastController,
    Toast,
    ToastTitle,
    useId
} from "@fluentui/react-components";
import "./SendMessageDialog.css";
import { createBulkSms } from "../../../utility/api/prospectService";

const SendMessageDialog: React.FC = () => {
    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const [prospects, setProspects] = useState<string[]>([]);
    const [prospectId, setProspectId] = useState<number | null>(null);
    const [body, setBody] = useState("");
    const [selectedDialerId, setSelectedDialerId] = useState<number>(1);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get("prospectName");
        if (name && name.trim()) {
            setProspects([name.trim()]);
        }

        const id = urlParams.get("prospectid");
        if (id) {
            setProspectId(Number(id));
        }
    }, []);

    const handleClose = () => {
        Office.context.ui.messageParent(JSON.stringify({ status: "closed" }));
    };

    const notify = (intent: "success" | "error", title: string) => {
        dispatchToast(
            <Toast>
                <ToastTitle>{title}</ToastTitle>
            </Toast>,
            { intent }
        );
    };

    const removeProspect = (index: number) => {
        setProspects((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!body.trim()) {
            notify("error", "Message text cannot be empty.");
            return;
        }

        if (!prospectId) {
            notify("error", "Prospect ID is missing.");
            return;
        }

        setIsSending(true);

        const payload = {
            sendanyway: 2,
            body: body,
            dialernumberid: selectedDialerId,
            textprospects: [
                {
                    prospectid: prospectId
                }
            ]
        };

        try {
            const response = await createBulkSms(payload);

            if (response && response.success) {
                notify("success", "Message sent successfully");
                setTimeout(() => {
                    handleClose();
                }, 1000);
            } else {
                notify("error", "Failed to send message.");
            }
        } catch (error) {
            notify("error", "An error occurred while sending the message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <FluentProvider theme={webLightTheme}>
            <Toaster toasterId={toasterId} />
            <div className="sms-root">
                <div className="sms-modal-header">
                    <h2 className="sms-modal-title" id="sms-modal-title">Send Message</h2>
                    <button className="sms-modal-close" onClick={handleClose} aria-label="Close" disabled={isSending}>
                        ×
                    </button>
                </div>

                <div className="sms-modal-body">
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
                                            disabled={isSending}
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
                                    disabled={isSending}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="sms-form-group">
                        <label className="sms-label">Send From</label>
                        <div className="sms-send-from">
                            <span className="sms-send-from-icon">✈</span>
                            <span className="sms-send-from-number">+12512612805</span>
                            <span className="sms-send-from-chevron">▾</span>
                        </div>
                    </div>

                    <div className="sms-form-group">
                        <label className="sms-label">Body</label>
                        <textarea
                            className="sms-body-textarea"
                            placeholder="Enter Your SMS"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            disabled={isSending}
                        />
                    </div>
                </div>

                <div className="sms-modal-footer">
                    <button className="sms-btn-cancel" onClick={handleClose} disabled={isSending}>
                        Cancel
                    </button>
                    <button className="sms-btn-send" onClick={handleSend} disabled={isSending}>
                        {isSending ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </FluentProvider>
    );
};

export default SendMessageDialog;
