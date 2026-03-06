import React, { useState, useRef, useCallback } from "react";
import { Button, Text, Tooltip } from "@fluentui/react-components";
import { Checkmark20Regular } from "@fluentui/react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCopy } from "@fortawesome/free-solid-svg-icons";
import "./InlineEditField.css";

export interface InlineEditFieldProps {
    label: string;
    value: string | React.ReactNode;
    copyValue?: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel?: () => void;
    editComponent: React.ReactNode;
    overlayComponent?: React.ReactNode;
}

const InlineEditField: React.FC<InlineEditFieldProps> = ({
    label,
    value,
    copyValue,
    isEditing,
    onEdit,
    onSave,
    editComponent,
    overlayComponent,
}) => {
    const handleCopy = useCallback(() => {
        if (!copyValue) return;

        // Primary: modern Clipboard API
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(copyValue).then(() => {
                console.log("Copied via Clipboard API:", copyValue);
            }).catch(() => {
                // Clipboard API failed (e.g. no focus / permission denied in Office iframe) — use fallback
                copyViaTextarea(copyValue);
            });
        } else {
            // Clipboard API not available — use fallback directly
            copyViaTextarea(copyValue);
        }
    }, [copyValue]);

    const copyViaTextarea = (text: string) => {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            // Keep out of the visible area but inside the document so execCommand works
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "0";
            textarea.style.width = "1px";
            textarea.style.height = "1px";
            textarea.style.opacity = "0";
            textarea.style.pointerEvents = "none";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const success = document.execCommand("copy");
            document.body.removeChild(textarea);
            if (!success) {
                console.error("execCommand copy returned false");
            } else {
                console.log("Copied via execCommand:", text);
            }
        } catch (err) {
            console.error("Fallback copy failed:", err);
        }
    };
    const [isHovered, setIsHovered] = useState(false);
    const [isFocusedWithin, setIsFocusedWithin] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showIcon = isHovered || isFocusedWithin || isEditing || !!overlayComponent;

    const handleContainerBlur = useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
            // Use setTimeout so relatedTarget is populated and we can check if focus
            // moved to another child within the same container
            blurTimeoutRef.current = setTimeout(() => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(document.activeElement)
                ) {
                    setIsFocusedWithin(false);
                    if (isEditing) {
                        onSave();
                    }
                }
            }, 0);
        },
        [isEditing, onSave]
    );

    const handleContainerFocus = useCallback(() => {
        // Clear any pending blur timeout (focus moved between children)
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        setIsFocusedWithin(true);
    }, []);

    return (
        <div
            className="field-container"
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={handleContainerFocus}
            onBlur={handleContainerBlur}
        >
            {/* Label row — copy button floats to the right of the label */}
            <div className="field-label-row">
                <Text className="field-label">{label}</Text>
                {copyValue && (
                    <div
                        className={`field-copy-fab ${showIcon ? "visible" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Copy"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleCopy();
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faCopy} style={{ fontSize: "11px" }} />
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="field-edit-row">
                    {editComponent}
                    <Button
                        appearance="subtle"
                        className={`field-edit-icon ${showIcon ? "visible" : ""}`}
                        icon={<Checkmark20Regular className="check-icon" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave();
                        }}
                        aria-label="Save"
                    />
                </div>
            ) : (
                <div className="field-display-row">
                    <div
                        className="field-value-box"
                        onClick={onEdit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onEdit();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="field-value-text">
                            {value || <span className="empty-placeholder">Empty</span>}
                        </span>
                    </div>
                    <div
                        className={`field-edit-icon-wrapper ${showIcon ? "visible" : ""}`}
                        style={overlayComponent ? { position: "relative" } : undefined}
                        onClick={(e) => {
                            if (overlayComponent) {
                                return;
                            }
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        <FontAwesomeIcon icon={faPencil} style={{ color: "currentColor", fontSize: "12px" }} />
                        {overlayComponent}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineEditField;
