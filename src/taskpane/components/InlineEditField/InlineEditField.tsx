import React, { useState, useRef, useCallback } from "react";
import { Button, Text } from "@fluentui/react-components";
import { Checkmark20Regular } from "@fluentui/react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import "./InlineEditField.css";

export interface InlineEditFieldProps {
    label: string;
    value: string | React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel?: () => void;
    editComponent: React.ReactNode;
}

const InlineEditField: React.FC<InlineEditFieldProps> = ({
    label,
    value,
    isEditing,
    onEdit,
    onSave,
    editComponent,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocusedWithin, setIsFocusedWithin] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showIcon = isHovered || isFocusedWithin || isEditing;

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
            <Text className="field-label">{label}</Text>
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
                <div
                    className="field-value-row"
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
                    <span className={`field-edit-icon-wrapper ${showIcon ? "visible" : ""}`}>
                        <FontAwesomeIcon icon={faPencil} style={{ color: "currentColor", fontSize: "10px" }} />
                    </span>
                </div>
            )}
        </div>
    );
};

export default InlineEditField;
