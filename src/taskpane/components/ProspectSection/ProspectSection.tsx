import React, { useEffect, useState } from "react";
import { Button, Text, Avatar, Link, Divider, Input, Tooltip } from "@fluentui/react-components";
import {
  Clock20Regular,
  Search20Regular,
  Pulse20Regular,
  Share20Regular,
  Building20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
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

interface ProspectSectionProps {
  accessToken?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  onClose?: () => void;
}

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

// Realtime prospect field list as single source of truth
const PROSPECT_FIELDS_CONFIG = [
  { fieldoriginid: 8, fieldname: "City", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 9, fieldname: "State", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 10, fieldname: "Country", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 11, fieldname: "Facebook", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 14, fieldname: "LinkedIn", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 17, fieldname: "Twitter", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 7, fieldname: "Company", fieldtype: 1, iscustomfield: false },
  { fieldoriginid: 18, fieldname: "Prospect Interests", fieldtype: 1, iscustomfield: false }
];

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

  // Local state for editing values before saving (can be enhanced to use specific field IDs)
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"info" | "activity" | "note">("info");

  // Modal State
  const [isAddToSequenceModalOpen, setIsAddToSequenceModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const filteredFields = PROSPECT_FIELDS_CONFIG.filter((field) =>
    field.fieldname.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    // console.log("email ::", email);

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

  // Helper to resolve field value from prospect object
  const getFieldValue = (field: typeof PROSPECT_FIELDS_CONFIG[0]) => {
    if (!prospect) return "";

    // Check local edit state first if currently editing? 
    // Ideally we use this for the input value, but standard value comes from prospect

    // Map specific fields if the API property names differ from fieldname
    // Based on common patterns:
    const key = field.fieldname.toLowerCase().replace(/\s+/g, ''); // "Prospect Interests" -> "prospectinterests"

    if (key === "company") return prospect.prospectaccount || prospect.company || "";
    // Check if it exists directly on prospect
    if (prospect[key]) return prospect[key];

    // Check if it exists with exact casing
    if (prospect[field.fieldname]) return prospect[field.fieldname];

    // Check lowercase
    if (prospect[field.fieldname.toLowerCase()]) return prospect[field.fieldname.toLowerCase()];

    // Fallback/Placeholder
    return "";
  };

  const handleEditStart = (fieldId: number, currentValue: string) => {
    setEditingFieldId(fieldId);
    setEditValues(prev => ({ ...prev, [fieldId]: currentValue }));
  };

  const handleEditChange = (fieldId: number, newValue: string) => {
    setEditValues(prev => ({ ...prev, [fieldId]: newValue }));
  };

  const handleSave = (fieldId: number) => {
    // Here we would call the API to save the new value
    // const newValue = editValues[fieldId];
    // saveProspectField(fieldId, newValue)...

    // For now, just close edit mode as per previous behavior (local state update not fully wired to persist without API)
    setEditingFieldId(null);
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
        <Tooltip content="Add to Sequence" relationship="label">
          <span>
            <Button
              appearance="subtle"
              icon={<FontAwesomeIcon icon={faPaperPlane} size="sm" className="icon-paperplane" />}
              className="action-button"
              onClick={() => setIsAddToSequenceModalOpen(true)}
            />
          </span>
        </Tooltip>
        <Tooltip content="Send Email" relationship="description">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faEnvelope} size="sm" className="icon-envelope" />}
            className="action-button"
            onClick={() => { }}
          />
        </Tooltip>
        <Tooltip content="Add Task" relationship="label">
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
        <Button appearance="secondary" className="pill-button" onClick={() => { }}>
          Bounced
        </Button>
        <Button appearance="secondary" className="pill-button" onClick={() => { }}>
          No Stage
        </Button>
      </div>

      {/* Social media icons row */}
      <div className="social-row">
        {isSearchOpen ? (
          <div className="search-input-container" style={{ marginLeft: 0 }}>
            <Input
              autoFocus
              value={searchQuery}
              onChange={(_e, data) => setSearchQuery(data.value)}
              placeholder="Search Prospects Fields"
              className="prospect-search-input"
              contentBefore={<Search20Regular className="search-icon" />}
              contentAfter={
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  onClick={handleSearchClear}
                  className="search-clear-button"
                  aria-label="Clear search"
                />
              }
            />
          </div>
        ) : (
          <>
            <div className="social-icons">
              <Tooltip content="Facebook" relationship="label">
                <Button
                  appearance="subtle"
                  className="social-button"
                  onClick={() => { }}
                  aria-label="Facebook"
                >
                  <span className="social-text social-text-bold">f</span>
                </Button>
              </Tooltip>
              <Tooltip content="Share" relationship="label">
                <Button
                  appearance="subtle"
                  icon={<Share20Regular />}
                  className="social-button"
                  onClick={() => { }}
                  aria-label="Share"
                />
              </Tooltip>
              <Tooltip content="Twitter" relationship="label">
                <Button
                  appearance="subtle"
                  className="social-button"
                  onClick={() => { }}
                  aria-label="Twitter"
                >
                  <span className="social-text">𝕏</span>
                </Button>
              </Tooltip>
            </div>
            <Tooltip content="Search" relationship="label">
              <Button
                appearance="subtle"
                icon={<Search20Regular />}
                className="search-button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              />
            </Tooltip>
          </>
        )}
      </div>

      {/* Divider */}
      <Divider className="divider" />

      {/* Bottom utility bar */}
      <div className="utility-bar" aria-label="Utility actions">
        <Tooltip content="Info" relationship="label">
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
        <Tooltip content="Activity" relationship="label">
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
      </div>

      {/* Tab Content */}
      <div className="scrollable-content">
        {activeTab === "info" && (
          <div className="info-container">
            {filteredFields.map((field) => {
              const currentValue = getFieldValue(field);
              const isEditing = editingFieldId === field.fieldoriginid;

              return (
                <InlineEditField
                  key={field.fieldoriginid}
                  label={field.fieldname}
                  value={currentValue}
                  isEditing={isEditing}
                  onEdit={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                  onSave={() => handleSave(field.fieldoriginid)}
                  editComponent={
                    <Input
                      value={editValues[field.fieldoriginid] || ""}
                      onChange={(_e, data) => handleEditChange(field.fieldoriginid, data.value)}
                      placeholder={`Enter ${field.fieldname}`}
                      className="input-full-width"
                    />
                  }
                />
              );
            })}
          </div>
        )}
        {activeTab === "activity" && (
          <div className="info-container">
            <Text className="info-title">No recent activity</Text>
          </div>
        )}
      </div>

      <AddToSequenceModal
        isOpen={isAddToSequenceModalOpen}
        onClose={() => setIsAddToSequenceModalOpen(false)}
      />
    </section >
  );
};

export default ProspectSection;
