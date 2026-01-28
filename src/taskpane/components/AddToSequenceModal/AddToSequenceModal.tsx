import React, { useEffect, useRef } from "react";

interface AddToSequenceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddToSequenceModal: React.FC<AddToSequenceModalProps> = ({ isOpen, onClose }) => {
    const dialogRef = useRef<Office.Dialog | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Construct absolute URL for the dialog
            const url = new URL("/dialog.html", window.location.origin).toString();

            Office.context.ui.displayDialogAsync(
                url,
                { height: 60, width: 40, displayInIframe: true },
                (asyncResult) => {
                    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                        console.error("Failed to open dialog: " + asyncResult.error.message);
                        onClose();
                    } else {
                        dialogRef.current = asyncResult.value;

                        // Handle messages from the dialog (e.g. submit or close button)
                        dialogRef.current.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
                            let message;
                            try {
                                message = JSON.parse(arg.message);
                            } catch (e) {
                                message = arg.message;
                            }

                            if (message.status === "closed") {
                                dialogRef.current?.close();
                                dialogRef.current = null;
                                onClose();
                            } else if (message.status === "submitted") {
                                console.log("Prospect added to sequence:", message.data);
                                // Here you would typically perform the actual logic or API call
                                dialogRef.current?.close();
                                dialogRef.current = null;
                                onClose();
                            }
                        });

                        // Handle external dialog close (e.g. user clicks X)
                        dialogRef.current.addEventHandler(Office.EventType.DialogEventReceived, (arg: any) => {
                            // 12006: DialogClosedByUser
                            if (arg.error === 12006) {
                                dialogRef.current = null;
                                onClose();
                            }
                        });
                    }
                }
            );
        } else {
            // If component updates and isOpen is false, ensure dialog is closed
            if (dialogRef.current) {
                dialogRef.current.close();
                dialogRef.current = null;
            }
        }
    }, [isOpen]);

    return null;
};

export default AddToSequenceModal;
