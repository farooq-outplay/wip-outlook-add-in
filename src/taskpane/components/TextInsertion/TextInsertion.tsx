import * as React from "react";
import { useState } from "react";
import { Button, Field, Textarea } from "@fluentui/react-components";
import "./TextInsertion.css";

/* global HTMLTextAreaElement */

interface TextInsertionProps {
  insertText: (text: string) => void;
}

const TextInsertion: React.FC<TextInsertionProps> = (props: TextInsertionProps) => {
  const [text, setText] = useState<string>("Some text.");

  const handleTextInsertion = async () => {
    await props.insertText(text);
    fetchUserData();
  };

  async function fetchUserData() {
    try {
      // const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
      // const data = await response.json();

      const response = await fetch("https://dev-accounts.outplayhq.com/api/user/locations");
      const data = await response.json();
      console.log("User Data:", data);
    } catch (error) {
      console.error("API call failed:", error);
      Office.context.mailbox.item.notificationMessages.replaceAsync("errorMsg", {
        type: "errorMessage",
        message: `API failed: ${error.message}`,
      });
    }
  }

  const handleTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  return (
    <div className="text-insertion-container">
      <Field
        className="text-area-field"
        size="large"
        label="Enter text to be inserted into the document."
      >
        <Textarea size="large" value={text} onChange={handleTextChange} />
      </Field>
      <Field className="insertion-instructions">Click the button to insert text.</Field>
      <Button appearance="primary" disabled={false} size="large" onClick={handleTextInsertion}>
        Insert text
      </Button>
    </div>
  );
};

export default TextInsertion;
