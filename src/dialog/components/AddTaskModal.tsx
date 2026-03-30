/// <reference types="office-js" />
import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Option,
  Textarea,
  Input,
  Label,
  FluentProvider,
  webLightTheme,
} from "@fluentui/react-components";
import { Clock24Regular } from "@fluentui/react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faShareNodes,
  faNoteSticky,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./AddTaskModal.css";

import { createTask } from "../../utility/api/taskService";
import { getAuthSession } from "../../utility/authSession";

type TaskType = "email" | "call" | "linkedin" | "twitter" | "general" | "sms" | "whatsapp";

// Maps UI task type string to API actiontype number
const TASK_TYPE_TO_ACTIONTYPE: Record<TaskType, number> = {
  email: 1,
  call: 2,
  linkedin: 3,
  twitter: 4,
  general: 5,
  sms: 6,
  whatsapp: 7,
};

// Maps UI priority label to API priority string
const PRIORITY_LABEL_TO_VALUE: Record<string, string> = {
  High: "1",
  Medium: "2",
  Low: "3",
};

const AddTaskModal: React.FC = () => {
  // State
  const [opportunity, setOpportunity] = useState("No Opportunity");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-01-08");
  const [time, setTime] = useState("11:25");
  const [assignTo, setAssignTo] = useState("Outplaytest22");
  const [priority, setPriority] = useState("High");
  const [taskType, setTaskType] = useState<TaskType>("email");
  const [actionParam, setActionParam] = useState("View Profile");
  const [taskName, setTaskName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleClose = () => {
    Office.context.ui.messageParent(JSON.stringify({ status: "closed" }));
  };

  const handleSave = async () => {
    setError(null);

    // 1. Get prospectid from URL
    const prospectId = Number(new URLSearchParams(window.location.search).get("prospectid"));

    if (!prospectId || isNaN(prospectId)) {
      setError("Invalid prospect. Please close and reopen the task dialog.");
      return;
    }

    // 2. Get current user ID from auth session
    const authSession = getAuthSession();
    const userId = authSession?.userId;

    if (!userId) {
      setError("Unable to determine current user. Please log in again.");
      return;
    }

    // 3. Combine date + time into ISO string: "YYYY-MM-DDTHH:MM:00"
    const taskscheduleddate = `${date}T${time}:00`;

    // 4. Build payload
    const payload = {
      actiontype: TASK_TYPE_TO_ACTIONTYPE[taskType],
      actionparameters: (taskType === "linkedin" || taskType === "twitter") ? actionParam : "",
      userid: userId,
      priority: PRIORITY_LABEL_TO_VALUE[priority] ?? "1",
      tasknotes: description,
      taskscheduleddate,
      opportunityid: opportunity === "No Opportunity" ? null : null, // TODO: use real opportunity ID from API
    };

    setIsSaving(true);

    try {
      const response = await createTask(prospectId, payload);

      if (response.success) {
        Office.context.ui.messageParent(
          JSON.stringify({ status: "saveTask", data: response.data })
        );
      } else {
        setError(response.error || "Failed to create task. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="task-modal-root">
        {/* Header */}
        <div className="task-header">
          <div className="task-header-title">
            {taskType === "email"
              ? "Create an Email Task"
              : taskType === "call"
                ? "Create a Call Task"
                : taskType === "linkedin"
                  ? "Create a Linkedin Task"
                  : taskType === "twitter"
                    ? "Create a Twitter Task"
                    : taskType === "sms"
                      ? "Create an SMS Task"
                      : taskType === "whatsapp"
                        ? "Create a WhatsApp Task"
                        : "Create a General Task"}
          </div>
        </div>

        {/* Icon Toolbar */}
        <div className="icon-row">
          {/* Email */}
          <button
            className={`icon-button theme-email ${taskType === "email" ? "active" : ""}`}
            onClick={() => setTaskType("email")}
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
          {/* Phone */}
          <button
            className={`icon-button theme-call ${taskType === "call" ? "active" : ""}`}
            onClick={() => setTaskType("call")}
          >
            <FontAwesomeIcon icon={faPhone} />
          </button>
          {/* LinkedIn (ShareNodes) */}
          <button
            className={`icon-button theme-linkedin ${taskType === "linkedin" ? "active" : ""}`}
            onClick={() => {
              setTaskType("linkedin");
              setActionParam("View Profile");
            }}
          >
            <FontAwesomeIcon icon={faShareNodes} />
          </button>
          {/* Twitter */}
          <button
            className={`icon-button theme-twitter ${taskType === "twitter" ? "active" : ""}`}
            onClick={() => {
              setTaskType("twitter");
              setActionParam("Follow");
            }}
          >
            <FontAwesomeIcon icon={faTwitter} />
          </button>
          {/* General (NoteSticky) */}
          <button
            className={`icon-button theme-general ${taskType === "general" ? "active" : ""}`}
            onClick={() => setTaskType("general")}
          >
            <FontAwesomeIcon icon={faNoteSticky} />
          </button>
          {/* SMS */}
          <button
            className={`icon-button theme-sms ${taskType === "sms" ? "active" : ""}`}
            onClick={() => setTaskType("sms")}
          >
            <FontAwesomeIcon icon={faCommentDots} />
          </button>
          {/* WhatsApp */}
          <button
            className={`icon-button theme-whatsapp ${taskType === "whatsapp" ? "active" : ""}`}
            onClick={() => setTaskType("whatsapp")}
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </button>
        </div>

        {/* Form Body */}
        <div className="form-container">
          {/* Task Name (General only) */}
          {taskType === "general" && (
            <div className="field-group">
              <Label className="field-label">Task Name</Label>
              <Input
                className="input-control"
                placeholder="Enter Task Name"
                value={taskName}
                onChange={(_e, data) => setTaskName(data.value)}
              />
            </div>
          )}

          {/* Action Parameters (Linkedin & Twitter only) */}
          {(taskType === "linkedin" || taskType === "twitter") && (
            <div className="field-group">
              <Label className="field-label">Action Parameters</Label>
              <Dropdown
                className="input-control"
                value={actionParam}
                onOptionSelect={(_e, data) => setActionParam(data.optionText || "")}
              >
                {taskType === "linkedin" ? (
                  <>
                    <Option>View Profile</Option>
                    <Option>Send Connection Request</Option>
                    <Option>Send Message</Option>
                    <Option>Interact with Post</Option>
                  </>
                ) : (
                  <>
                    <Option>Follow</Option>
                    <Option>Message</Option>
                    <Option>Tweet</Option>
                    <Option>Retweet</Option>
                    <Option>Like</Option>
                  </>
                )}
              </Dropdown>
            </div>
          )}

          {/* Opportunity */}
          <div className="field-group">
            <Label className="field-label">Select Opportunity</Label>
            <Dropdown
              className="input-control"
              value={opportunity}
              onOptionSelect={(_e, data) => setOpportunity(data.optionText || "")}
            >
              <Option>No Opportunity</Option>
              <Option>Deal 1</Option>
              <Option>Deal 2</Option>
            </Dropdown>
          </div>

          {/* Task Description / Message Body */}
          <div className="field-group">
            <Label className="field-label">
              {(taskType === "sms" || taskType === "whatsapp") ? "Message Body" : "Task Description"}
            </Label>
            <Textarea
              className="input-control"
              placeholder="Enter your description"
              rows={4}
              value={description}
              onChange={(_e, data) => setDescription(data.value)}
            />
          </div>

          {/* Date & Time */}
          <div className="row-2-col">
            <div className="col-flex">
              <Label className="field-label">Date</Label>
              <Input
                type="date"
                value={date}
                className="input-control"
                onChange={(_e, data) => setDate(data.value)}
              />
            </div>
            <div className="col-flex">
              <Label className="field-label">Time</Label>
              <Input
                type="time"
                value={time}
                contentAfter={<Clock24Regular style={{ color: "var(--colorNeutralForeground3)" }} />}
                className="input-control"
                onChange={(_e, data) => setTime(data.value)}
              />
            </div>
          </div>

          {/* Assign To & Priority */}
          <div className="row-2-col">
            <div className="col-flex">
              <Label className="field-label">Assign to</Label>
              <Dropdown
                className="input-control"
                value={assignTo}
                onOptionSelect={(_e, data) => setAssignTo(data.optionText || "")}
              >
                <Option>Outplaytest22</Option>
                <Option>User 2</Option>
              </Dropdown>
            </div>
            <div className="col-flex">
              <Label className="field-label">Priority</Label>
              <Dropdown
                className="input-control"
                value={priority}
                onOptionSelect={(_e, data) => setPriority(data.optionText || "")}
              >
                <Option>High</Option>
                <Option>Medium</Option>
                <Option>Low</Option>
              </Dropdown>
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <div style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="task-footer">
          <Button appearance="transparent" className="cancel-button" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button appearance="primary" className="save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </FluentProvider>
  );
};

export default AddTaskModal;
