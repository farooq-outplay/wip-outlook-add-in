import React, { useEffect, useState } from "react";
import { PROSPECT_INFO } from "../../prospectInfoHardcoded";
import { Button, Text, Avatar, Link, Divider, Input } from "@fluentui/react-components";
import Tooltip from "../Tooltip/Tooltip";
import {
  ArrowTrendingLines20Regular,
  Mail20Regular,
  TaskListSquareLtr20Regular,
  Dismiss20Regular,
  Clock20Regular,
  Search20Regular,
  Document20Regular,
  Pulse20Regular,
  Share20Regular,
  Building20Regular,
  Checkmark20Regular,
} from "@fluentui/react-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faEnvelope,
  faListCheck,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import "./ProspectSection.css";
import AddToSequenceModal from "../AddToSequenceModal/AddToSequenceModal";
import MoreOptionsMenu from "../MoreOptionsMenu/MoreOptionsMenu";
import { getProspectByEmail } from "../../../utility/api/prospectService";
import Header from "../Header/Header";

interface ProspectSectionProps {
  accessToken?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  onClose?: () => void;
}

// Helper Types
type FieldType = "text" | "date" | "mobile" | "custom";

interface InlineEditFieldProps {
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
  return (
    <div className="field-container">
      <Text className="field-label">{label}</Text>
      {isEditing ? (
        <div className="field-edit-row">
          {editComponent}
          <Button
            appearance="subtle"
            icon={<Checkmark20Regular className="check-icon" />}
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            aria-label="Save"
          />
        </div>
      ) : (
        <div className="field-value-interactive" onClick={onEdit} role="button" tabIndex={0}>
          {value || <span className="empty-placeholder">Empty</span>}
        </div>
      )}
    </div>
  );
};

const ProspectSection: React.FC<ProspectSectionProps> = ({
  accessToken,
  firstName,
  lastName,
  email,
  onClose,
}) => {
  const [prospect, setProspect] = useState<any>(null);
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientDomain, setRecipientDomain] = useState<string>("");
  const [recipientInitials, setRecipientInitials] = useState<string>("");
  // Field States
  const [linkedIn, setLinkedIn] = useState<string>("");
  const [mobileCountry, setMobileCountry] = useState<string>("US");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [mobileExt, setMobileExt] = useState<string>("");
  const [consentDate, setConsentDate] = useState<string>("");
  const [consentForCall, setConsentForCall] = useState<string>("");
  const [account, setAccount] = useState<string>("");

  // Edit Mode States
  const [editingField, setEditingField] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"info" | "activity" | "note">("info");

  // Modal State
  const [isAddToSequenceModalOpen, setIsAddToSequenceModalOpen] = useState(false);

  // Dynamic fields from pseudo-database (indices 5 onwards, as 0-4 are handled manually above)
  const [extraFields, setExtraFields] = useState(PROSPECT_INFO.slice(5));

  const handleExtraFieldChange = (index: number, newVal: string) => {
    const updated = [...extraFields];
    updated[index] = { ...updated[index], value: newVal };
    setExtraFields(updated);
  };

  useEffect(() => {
    const item = Office.context.mailbox.item;
    if (item && item.to && item.to.length > 0) {
      const firstRecipient = item.to[0];
      const email = firstRecipient.emailAddress;
      const displayName = firstRecipient.displayName;

      // Determine name: Use display name if available, else fallback to email username
      let nameToDisplay = displayName;
      if (!nameToDisplay) {
        nameToDisplay = email.split("@")[0];
      }
      setRecipientName(nameToDisplay);

      // Determine domain
      const domainPart = email.split("@")[1] || "";
      setRecipientDomain(domainPart);

      // Determine initials
      let initials = "";
      if (displayName) {
        const parts = displayName.split(" ").filter(Boolean);
        if (parts.length > 0) {
          initials = parts[0][0];
          if (parts.length > 1) {
            initials += parts[parts.length - 1][0];
          }
        }
      }
      if (!initials && email) {
        initials = email[0];
      }
      setRecipientInitials(initials.toUpperCase());
    } else {
      // Fallback if no recipient found (unlikely in read mode but good for safety)
      const fallbackName = [firstName, lastName].filter(Boolean).join(" ") || "Prospect";
      setRecipientName(fallbackName);
      const fallbackDomain = email?.split("@")[1] || "";
      setRecipientDomain(fallbackDomain);
      const fallbackInitials =
        (firstName?.[0] || "") + (lastName?.[0] || (!firstName && email ? email[0] : ""));
      setRecipientInitials(fallbackInitials.toUpperCase());
    }

    console.log("email ::", email);

    getProspectInfoByEmail(email);
  }, [firstName, lastName, email]);

  const getProspectInfoByEmail = async (email: string) => {
    try {
      const data = await getProspectByEmail(email);
      setProspect(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Use state values for rendering
  const fullName = recipientName;
  const domain = recipientDomain;
  const initials = recipientInitials;

  const openAddTaskDialog = () => {
    Office.context.ui.displayDialogAsync(
      window.location.origin + "/dialog.html?dialog=addTask",
      { height: 60, width: 40, displayInIframe: true },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Dialog failed to open:", asyncResult.error.message);
        } else {
          const dialog = asyncResult.value;
          dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
            const message = JSON.parse(arg.message);
            if (message.status === "closed") {
              dialog.close();
            } else if (message.status === "saveTask") {
              console.log("Task Saved from Dialog:", message.data);
              dialog.close();
            }
          });
        }
      }
    );
  };

  return (
    <section className="prospect-section">
      {/* Avatar + name/email/domain */}
      <div className="header-content">
        <Avatar
          name={fullName}
          initials={initials.toUpperCase()}
          size={48}
          shape="square"
          color="colorful"
        />
        <div className="name-block">
          <Text className="name-text">{fullName}</Text>
          <Text className="handle-text">@{domain}</Text>
        </div>
      </div>

      {/* Company/Domain row */}
      {domain && (
        <div className="company-row">
          <Building20Regular />
          <Link href={`https://${domain}`} target="_blank" className="domain-link">
            {domain}
          </Link>
        </div>
      )}

      {/* Timezone row */}
      <div className="timezone-row">
        <Clock20Regular />
        <span>No Timezone</span>
      </div>

      {/* Action icons row */}
      <div className="actions-row" aria-label="Prospect quick actions">
        <Tooltip content="Add to Sequence">
          <span>
            <Button
              appearance="subtle"
              icon={<FontAwesomeIcon icon={faPaperPlane} size="sm" className="icon-paperplane" />}
              className="action-button"
              onClick={() => setIsAddToSequenceModalOpen(true)}
            />
          </span>
        </Tooltip>
        <Tooltip content="Send Email">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faEnvelope} size="sm" className="icon-envelope" />}
            className="action-button"
            onClick={() => {}}
          />
        </Tooltip>
        <Tooltip content="Add Task">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faListCheck} size="sm" className="icon-listcheck" />}
            className="action-button"
            onClick={openAddTaskDialog}
          />
        </Tooltip>
        <MoreOptionsMenu
          onPause={() => console.log("Pause clicked")}
          onMarkFinished={() => console.log("Mark as Finished clicked")}
          onOptOut={() => console.log("Opt-out clicked")}
          onDelete={() => console.log("Delete clicked")}
          onLogCall={() => console.log("Log Call clicked")}
        />
      </div>

      {/* Status pills */}
      <div className="status-row">
        <Button appearance="secondary" className="pill-button" onClick={() => {}}>
          Bounced
        </Button>
        <Button appearance="secondary" className="pill-button" onClick={() => {}}>
          No Stage
        </Button>
      </div>

      {/* Social media icons row */}
      <div className="social-row">
        <div className="social-icons">
          <Tooltip content="Facebook">
            <Button
              appearance="subtle"
              className="social-button"
              onClick={() => {}}
              aria-label="Facebook"
            >
              <span className="social-text social-text-bold">f</span>
            </Button>
          </Tooltip>
          <Tooltip content="Share">
            <Button
              appearance="subtle"
              icon={<Share20Regular />}
              className="social-button"
              onClick={() => {}}
              aria-label="Share"
            />
          </Tooltip>
          <Tooltip content="Twitter">
            <Button
              appearance="subtle"
              className="social-button"
              onClick={() => {}}
              aria-label="Twitter"
            >
              <span className="social-text">𝕏</span>
            </Button>
          </Tooltip>
        </div>
        <Tooltip content="Search">
          <Button
            appearance="subtle"
            icon={<Search20Regular />}
            className="search-button"
            onClick={() => {}}
            aria-label="Search"
          />
        </Tooltip>
      </div>

      {/* Divider */}
      <Divider className="divider" />

      {/* Bottom utility bar */}
      <div className="utility-bar" aria-label="Utility actions">
        <Tooltip content="Info">
          <Button
            appearance="subtle"
            icon={
              <FontAwesomeIcon
                icon={faCircleInfo}
                size="lg"
                className={`tab-icon tab-icon-info ${activeTab === "info" ? "" : ""}`}
              />
            }
            className={`utility-button ${activeTab === "info" ? "active-tab-button" : ""}`}
            onClick={() => setActiveTab("info")}
            aria-label="Info"
          />
        </Tooltip>
        <Tooltip content="Activity">
          <Button
            appearance="subtle"
            icon={
              <Pulse20Regular
                className={`tab-icon tab-icon-activity ${activeTab === "activity" ? "" : ""}`}
              />
            }
            className={`utility-button ${activeTab === "activity" ? "active-tab-button" : ""}`}
            onClick={() => setActiveTab("activity")}
            aria-label="Activity"
          />
        </Tooltip>
        {/* <Tooltip content="Note">
          <Button
            appearance="subtle"
            icon={<TaskListSquareLtr20Regular className={`tab-icon tab-icon-note ${activeTab === "note" ? "" : ""}`} />}
            className={`utility-button ${activeTab === "note" ? "active-tab-button" : ""}`}
            onClick={() => setActiveTab("note")}
            aria-label="Note"
          />
        </Tooltip> */}
      </div>

      {/* Tab Content */}
      <div className="scrollable-content">
        {activeTab === "info" && (
          <div className="info-container">
            {/* LinkedIn */}
            <InlineEditField
              label="LinkedIn"
              value={linkedIn || "No LinkedIn"}
              isEditing={editingField === "linkedIn"}
              onEdit={() => setEditingField("linkedIn")}
              onSave={() => setEditingField(null)}
              editComponent={
                <Input
                  value={linkedIn}
                  onChange={(_e, data) => setLinkedIn(data.value)}
                  placeholder="Enter LinkedIn URL"
                  className="input-full-width"
                />
              }
            />

            {/* Mobile Phone */}
            <div className="field-container">
              <Text className="field-label">Mobile Phone</Text>
              {editingField === "mobilePhone" ? (
                <div className="mobile-input-container">
                  <div className="mobile-main-row">
                    <select
                      className="country-select"
                      value={mobileCountry}
                      onChange={(e) => setMobileCountry(e.target.value)}
                    >
                      <option value="US">🇺🇸 +1</option>
                      <option value="UK">🇬🇧 +44</option>
                      <option value="IN">🇮🇳 +91</option>
                      <option value="CA">🇨🇦 +1</option>
                      <option value="AU">🇦🇺 +61</option>
                    </select>
                    <Input
                      value={mobileNumber}
                      onChange={(_e, data) => setMobileNumber(data.value)}
                      placeholder="No Phone"
                      className="input-full-width"
                    />
                    <Button
                      appearance="subtle"
                      icon={<Checkmark20Regular className="check-icon" />}
                      onClick={() => setEditingField(null)}
                      aria-label="Save"
                    />
                  </div>
                  <Input
                    value={mobileExt}
                    onChange={(_e, data) => setMobileExt(data.value)}
                    placeholder="Ext"
                    className="ext-input"
                  />
                </div>
              ) : (
                <div
                  className="field-value-interactive"
                  onClick={() => setEditingField("mobilePhone")}
                  role="button"
                  tabIndex={0}
                >
                  {mobileNumber ? (
                    <span>
                      {mobileCountry === "US" && "🇺🇸"}
                      {mobileCountry === "UK" && "🇬🇧"}
                      {mobileCountry === "IN" && "🇮🇳"}
                      {mobileCountry === "CA" && "🇨🇦"}
                      {mobileCountry === "AU" && "🇦🇺"} {mobileNumber}{" "}
                      {mobileExt ? `ext ${mobileExt}` : ""}
                    </span>
                  ) : (
                    "No Phone"
                  )}
                </div>
              )}
            </div>

            {/* Consent Date */}
            <InlineEditField
              label="Consent Date"
              value={consentDate || "YYYY-MM-DD"}
              isEditing={editingField === "consentDate"}
              onEdit={() => setEditingField("consentDate")}
              onSave={() => setEditingField(null)}
              editComponent={
                <Input
                  type="date"
                  value={consentDate}
                  onChange={(_e, data) => setConsentDate(data.value)}
                  className="input-full-width"
                />
              }
            />

            {/* Consent for Call */}
            <InlineEditField
              label="Consent for Call"
              value={consentForCall || "No consent_for_call"}
              isEditing={editingField === "consentForCall"}
              onEdit={() => setEditingField("consentForCall")}
              onSave={() => setEditingField(null)}
              editComponent={
                <Input
                  value={consentForCall}
                  onChange={(_e, data) => setConsentForCall(data.value)}
                  placeholder="Enter consent status"
                  className="input-full-width"
                />
              }
            />

            {/* Account */}
            <InlineEditField
              label="Account"
              value={account || "--"}
              isEditing={editingField === "account"}
              onEdit={() => setEditingField("account")}
              onSave={() => setEditingField(null)}
              editComponent={
                <Input
                  value={account}
                  onChange={(_e, data) => setAccount(data.value)}
                  placeholder="Enter Account"
                  className="input-full-width"
                />
              }
            />

            {/* Dynamic Fields from PROSPECT_INFO (remaining items) */}
            {extraFields.map((field, index) => (
              <InlineEditField
                key={`${field.title}-${index}`}
                label={field.title}
                value={field.value}
                isEditing={editingField === `extra-${index}`}
                onEdit={() => setEditingField(`extra-${index}`)}
                onSave={() => setEditingField(null)}
                editComponent={
                  <Input
                    value={field.value}
                    onChange={(_e, data) => handleExtraFieldChange(index, data.value)}
                    className="input-full-width"
                  />
                }
              />
            ))}
          </div>
        )}
        {activeTab === "activity" && (
          <div className="info-container">
            <Text className="info-title">No recent activity</Text>
          </div>
        )}
        {activeTab === "note" && (
          <div className="info-container">
            <Text className="info-title">No notes</Text>
          </div>
        )}
      </div>

      <AddToSequenceModal
        isOpen={isAddToSequenceModalOpen}
        onClose={() => setIsAddToSequenceModalOpen(false)}
      />
    </section>
  );
};

export default ProspectSection;
