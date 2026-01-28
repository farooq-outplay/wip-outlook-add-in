/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office */

Office.onReady(() => {
  // If needed, Office.js is ready to be called.
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event
 */
function action(event: Office.AddinCommands.Event) {
  const message: Office.NotificationMessageDetails = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Performed action.",
    icon: "Icon80",
    persistent: true,
  };

  // Show a notification message.
  Office.context.mailbox.item?.notificationMessages.replaceAsync(
    "ActionPerformanceNotification",
    message
  );

  // Be sure to indicate when the add-in command function is complete.
  event.completed();
}

// Register the function with Office.
Office.actions.associate("action", action);
Office.actions.associate("onMessageSendHandler", onMessageSendHandler);

/**
 * Handles the OnMessageSend event.
 * Injects an <img> tag into the body before sending.
 * @param event The Office.AddinCommands.Event object.
 */
function onMessageSendHandler(event: Office.AddinCommands.Event) {
  // Check if the event object has the completed method (standard for Smart Alerts)
  if (!event || !event.completed) {
    return;
  }

  const imageHtml =
    '<img src="https://via.placeholder.com/1x1" alt="tracking" width="1" height="1" style="display:none;" />';

  // Use appendOnSendAsync to add the image to the end of the body when the message is sent
  Office.context.mailbox.item.body.appendOnSendAsync(
    imageHtml,
    { coercionType: Office.CoercionType.Html },
    (asyncResult) => {
      console.log(asyncResult);
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        // Failed to inject. Define whether to block sending or allow.
        // User goal: "Reliably injected". If it fails, we should probably block and notify.
        const message: Office.NotificationMessageDetails = {
          type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
          message: "Failed to inject content. Please try sending again.",
          icon: "Icon80",
          persistent: false,
        };
        Office.context.mailbox.item.notificationMessages.replaceAsync("InjectionFailure", message);

        // Block sending
        event.completed({ allowEvent: false });
      } else {
        // Success
        event.completed({ allowEvent: true });
      }
    }
  );
}
