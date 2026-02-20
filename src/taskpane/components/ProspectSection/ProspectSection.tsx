import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Button, Text, Avatar, Link, Divider, Input, Tooltip, Textarea, Checkbox, Select } from "@fluentui/react-components";

import {
  Clock20Regular,
  Search20Regular,
  Pulse20Regular,
  Share20Regular,
  Building20Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faEnvelope,
  faListCheck,
  faCircleInfo,
  faPhone,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./ProspectSection.css";
import AddToSequenceModal from "../AddToSequenceModal/AddToSequenceModal";
import MoreOptionsMenu from "../MoreOptionsMenu/MoreOptionsMenu";
import PhoneInputWithCountrySelector from "../PhoneInputWithCountrySelector/PhoneInputWithCountrySelector";
import { saveProspect } from "../../../utility/api/prospectService";
import InlineEditField from "../InlineEditField/InlineEditField";

interface ProspectSectionProps {
  prospect: any;
  onClose?: () => void;
}



const predefinedFieldsNameForPin = {
  FirstName: 1,
  LastName: 2,
  Email: 3,
  Phone: 4,
  Designation: 5,
  Timezone: 6,
  ProspectAccount: 7,
  ProspectStage: 8,
  Owner: 9,
};

const getFieldType = (fieldname: string) => {
  const name = fieldname.toLowerCase();
  if (name === "email") return "email";
  if (name === "phone") return "phone";
  // Default to text (1) for others
  return 1;
};

// Helper: Convert render-friendly fieldname to backend property key (legacy support)
const getProspectPropertyKey = (fieldname: string) => {
  return fieldname.toLowerCase().replace(/\s+/g, '');
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString();
};

/** Convert an ISO/date string to YYYY-MM-DD for <input type="date"> */
const toDateInputValue = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toISOString().split("T")[0];
};

/** Check if a fieldtype represents a date */
const isDateFieldType = (fieldtype: number | string) => {
  const ft = typeof fieldtype === "string" ? fieldtype.toLowerCase() : fieldtype;
  return ft === "prospect_date" || ft === "prospect_date_time" || ft === 3 || ft === 5;
};

/** Format a value for display (read mode) based on field type */
const getDisplayValue = (field: { fieldtype: number | string }, rawValue: string) => {
  if (!rawValue) return "";
  if (isDateFieldType(field.fieldtype)) {
    return formatDate(rawValue);
  }
  return rawValue;
};






const ProspectSection: React.FC<ProspectSectionProps> = ({
  prospect: initialProspect,
  onClose,
}) => {
  const [prospect, setProspect] = useState<any>(initialProspect);
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
  const [showCustomFields, setShowCustomFields] = useState(false);

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const displayFields = useMemo(() => {
    if (!prospect) return [];

    // 1. Build Predefined Fields (from ProspectSection2 logic)
    const predefined: any[] = [];
    for (const [propertyKey, propertyValue] of Object.entries(predefinedFieldsNameForPin)) {
      if (!Number.isNaN(Number(propertyKey))) continue;
      predefined.push({
        fieldoriginid: propertyValue,
        fieldorigin: 0,
        fieldname: propertyKey,
        iscustomfield: false,
        fieldtype: getFieldType(propertyKey), // Augment with type for rendering
      });
    }

    // 2. Merge with prospectFieldsList
    // Note: ProspectSection2 logic appends all list items. It does not dedup.
    // We assume standard fields in prospectFieldsList might duplicate pinned ones?
    // ProspectSection2 expects them to be distinct or just renders both.
    // We will follow "Merge predefined fields + prospect.prospectFieldsList".
    let combined = [
      ...predefined,
      ...(prospect.prospectFieldsList || []),
    ];

    // 3. Filter based on search query
    if (searchQuery) {
      combined = combined.filter((field) =>
        field.fieldname && field.fieldname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return combined;
  }, [prospect, searchQuery]);

  useEffect(() => {
    setProspect(initialProspect);
  }, [initialProspect]);


  useEffect(() => {
    if (prospect) {
      const { firstname, lastname, emailid, email } = prospect;
      const currentEmail = emailid || email || "";
      const currentFirstName = firstname || "";
      const currentLastName = lastname || "";

      // Determine name
      let nameToDisplay = [currentFirstName, currentLastName].filter(Boolean).join(" ");
      if (!nameToDisplay && currentEmail) {
        nameToDisplay = currentEmail.split("@")[0];
      }
      setRecipientName(nameToDisplay || "Prospect");

      // Determine domain
      const domainPart = currentEmail.split("@")[1] || "";
      setRecipientDomain(domainPart);

      // Determine initials
      let initials = "";
      if (currentFirstName) initials += currentFirstName[0];
      if (currentLastName) initials += currentLastName[0];
      if (!initials && currentEmail) initials = currentEmail[0];

      setRecipientInitials(initials.toUpperCase());
    }
  }, [prospect]);

  // Helper to resolve raw field value from prospect object (NOT pre-formatted)
  const getFieldValue = (field: { fieldoriginid: number; fieldname: string }) => {
    if (!prospect) return "";

    // 1. Check direct prospect properties based on normalized name
    // This handles the standard fields like FirstName, Email which are root props
    const key = getProspectPropertyKey(field.fieldname);

    if (key === "firstname") return prospect.firstname || "";
    if (key === "lastname") return prospect.lastname || "";
    if (key === "email") return prospect.emailid || prospect.email || "";
    if (key === "phone") return prospect.flatphone || prospect.phone || "";
    if (key === "designation" || key === "title") return prospect.designation || prospect.title || "";
    if (key === "timezone") return prospect.timezone || "";
    if (key === "prospectaccount" || key === "company") return prospect.prospectaccount || prospect.company || "";
    if (key === "prospectstage") return prospect.prospectstage || prospect.stage || "";
    if (key === "owner") return prospect.owner || "";

    // 2. Check prospectFieldsList
    if (prospect.prospectFieldsList) {
      // Try ID match first
      const fieldItem = prospect.prospectFieldsList.find((f: any) => f.fieldoriginid === field.fieldoriginid);
      if (fieldItem) {
        return fieldItem.fieldtext ?? fieldItem.value ?? "";
      }

      // Try Name match
      const fieldItemByName = prospect.prospectFieldsList.find((f: any) =>
        f.fieldname && f.fieldname.toLowerCase() === field.fieldname.toLowerCase()
      );
      if (fieldItemByName) {
        return fieldItemByName.fieldtext ?? fieldItemByName.value ?? "";
      }
    }

    // 3. Fallback checks for old hardcoded keys/dates
    if (key === "sdrfirsttouchdate") return prospect.sdrfirsttouchdate || prospect.firsttouchdate || prospect.prospectDetails?.firsttouchdate || "";
    if (key === "createddate") return prospect.createddate || "";
    if (key === "lastcontacteddate") return prospect.lastcontacteddate || prospect.lasttouchdate || prospect.prospectDetails?.lasttouchdate || "";
    if (key === "lastmodifieddate") return prospect.lastmodifieddate || "";

    // General fallback
    if (prospect[key]) return prospect[key];
    if (prospect[field.fieldname]) return prospect[field.fieldname];

    return "";
  };

  const renderFieldInput = (field: any, currentValue: string, onChange: (val: string) => void) => {
    // Force fieldtype to lowercase string for robust matching
    const ft = typeof field.fieldtype === "string" ? field.fieldtype.toLowerCase() : field.fieldtype;

    const commonInputProps = {
      value: currentValue,
      onChange: (_e: any, data: any) => onChange(data.value),
      placeholder: `Enter ${field.fieldname}`,
      className: "input-full-width",
    };

    // ── Date / DateTime (ft=3/5) ──
    if (ft === "prospect_date" || ft === 3) {
      return (
        <Input
          {...commonInputProps}
          type="date"
          value={toDateInputValue(currentValue)}
          onChange={(_e: any, data: any) => onChange(data.value)}
        />
      );
    }
    if (ft === "prospect_date_time" || ft === 5) {
      return <Input {...commonInputProps} type="datetime-local" />;
    }

    // ── Number (ft=2) ──
    if (ft === "prospect_number" || ft === 2) {
      return <Input {...commonInputProps} type="number" />;
    }

    // ── Email ──
    if (ft === "email") {
      return <Input {...commonInputProps} type="email" />;
    }

    // ── URL (ft=9) ──
    if (ft === "prospect_url" || ft === 9) {
      return <Input {...commonInputProps} type="url" />;
    }

    // ── Multi-line / Textarea (ft=15) ──
    if (ft === "prospect_multi_line" || ft === 15) {
      return (
        <Textarea
          value={currentValue}
          onChange={(_e: any, data: any) => onChange(data.value)}
          placeholder={`Enter ${field.fieldname}`}
          className="input-full-width field-textarea"
          resize="vertical"
          rows={3}
        />
      );
    }

    // ── Dropdown / Pick-list (ft=6, 14) ──
    if (
      ft === "prospect_dropdown" ||
      ft === "prospect_pick_list" ||
      ft === "prospect_picklist" ||
      ft === "prospect_single_select_dropdown" ||
      ft === 6 ||
      ft === 14
    ) {
      const options: string[] = field.options || field.fieldoptions || [];
      return (
        <Select
          value={currentValue}
          onChange={(_e: any, data: any) => onChange(data.value)}
          className="input-full-width field-select"
        >
          <option value="">Select {field.fieldname}</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      );
    }

    // ── Lookup (ft=8) ──
    if (ft === "prospect_lookup" || ft === 8) {
      return (
        <Input
          {...commonInputProps}
          contentAfter={<Search20Regular className="search-icon" />}
          type="text"
          placeholder={`Search ${field.fieldname}...`}
        />
      );
    }

    // ── Boolean ──
    if (ft === "prospect_boolean" || ft === "boolean") {
      return (
        <div className="field-toggle-row">
          <Checkbox
            checked={currentValue === "true"}
            onChange={(_e: any, data: any) => onChange(data.checked ? "true" : "false")}
            label={field.fieldname}
          />
        </div>
      );
    }

    // ── Default: Text input (fieldtype 1 or prospect_text or unknown) ──
    return <Input {...commonInputProps} type="text" />;
  };

  const handleEditStart = (fieldId: number, currentValue: string) => {
    setEditingFieldId(fieldId);
    setEditValues(prev => ({ ...prev, [fieldId]: currentValue }));
  };

  const handleEditChange = (fieldId: number, newValue: string) => {
    setEditValues(prev => ({ ...prev, [fieldId]: newValue }));
  };

  const handleSave = async (fieldId: number) => {
    const newValue = editValues[fieldId];
    // If no change or undefined, just exit
    if (newValue === undefined) {
      setEditingFieldId(null);
      return;
    }

    // 1. Create a shallow copy of prospect
    const updatedProspect = { ...prospect };

    // 2. Find the field config to know what we are updating
    const fieldConfig = displayFields.find(f => f.fieldoriginid === fieldId);

    if (!fieldConfig) {
      console.error("Field config not found for id:", fieldId);
      setEditingFieldId(null);
      return;
    }

    // 3. Update the property on updatedProspect

    // Always try to update in prospectFieldsList if the field exists there (handles both custom and system fields in the list)
    if (updatedProspect.prospectFieldsList) {
      const fieldIndex = updatedProspect.prospectFieldsList.findIndex((f: any) => f.fieldoriginid === fieldId);
      if (fieldIndex !== -1) {
        // Create copy of the field object
        const updatedField = { ...updatedProspect.prospectFieldsList[fieldIndex], value: newValue, fieldtext: newValue }; // Optimistic update of text
        // Create copy of the list
        const updatedList = [...updatedProspect.prospectFieldsList];
        updatedList[fieldIndex] = updatedField;
        updatedProspect.prospectFieldsList = updatedList;
      }
    }

    // Update root property for standard fields if needed (compatibility with legacy props)
    if (!fieldConfig.iscustomfield) {
      // Standard/System Field Mapping 
      const key = getProspectPropertyKey(fieldConfig.fieldname);

      if (key === "firstname") updatedProspect.firstname = newValue;
      else if (key === "lastname") updatedProspect.lastname = newValue;
      else if (key === "email") updatedProspect.emailid = newValue;
      else if (key === "phone") updatedProspect.flatphone = newValue;
      else if (key === "designation" || key === "title") updatedProspect.designation = newValue;
      else if (key === "prospectaccount" || key === "company") updatedProspect.prospectaccount = newValue;
      else if (key === "timezone") updatedProspect.timezone = newValue;
      else if (key === "prospectstage") updatedProspect.prospectstage = newValue; // check API expectation for this?
      else if (key === "owner") updatedProspect.owner = newValue;
      else {
        // Fallback: try to match fieldname directly
        (updatedProspect as any)[key] = newValue;
        // Also try strict fieldname
        (updatedProspect as any)[fieldConfig.fieldname] = newValue;
      }
    }

    // 4. Call API
    try {
      // Optimistic update
      setProspect(updatedProspect);
      setEditingFieldId(null);

      // const { saveProspect } = require("../../../utility/api/prospectService"); // Inline import to avoid circular dep if any, or just convenience
      await saveProspect(updatedProspect);
    } catch (error) {
      console.error("Failed to save prospect:", error);
      // Revert? For now just log.
      // Could re-fetch prospect to revert.
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
        <Tooltip content="Call" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faPhone} size="sm" className="icon-phone" />}
            className="action-button"
            onClick={() => { }}
          />
        </Tooltip>
        <Tooltip content="Text Message" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faCommentDots} size="sm" className="icon-comment" />}
            className="action-button"
            onClick={() => { }}
          />
        </Tooltip>
        <Tooltip content="WhatsApp" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faWhatsapp} size="sm" className="icon-whatsapp" />}
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
            {/* System Fields */}
            {displayFields
              .filter((field) => !field.iscustomfield)
              .map((field) => {
                const currentValue = getFieldValue(field);
                const isEditing = editingFieldId === field.fieldoriginid;

                // ── Phone field: custom renderer ──
                if (field.fieldoriginid === 4) {
                  return (
                    <div className="field-container" key={field.fieldoriginid}>
                      <Text className="field-label">Mobile Phone (Default)</Text>
                      {isEditing ? (
                        <PhoneInputWithCountrySelector
                          value={String(currentValue)}
                          onSave={(fullPhone) => {
                            handleEditChange(field.fieldoriginid, fullPhone);
                            // Use a micro-task so editValues is flushed before handleSave reads it
                            setTimeout(() => {
                              setEditValues((prev) => {
                                const updated = { ...prev, [field.fieldoriginid]: fullPhone };
                                // Trigger save with the updated value
                                const doSave = async () => {
                                  const updatedProspect = { ...prospect };
                                  if (updatedProspect.prospectFieldsList) {
                                    const idx = updatedProspect.prospectFieldsList.findIndex(
                                      (f: any) => f.fieldoriginid === field.fieldoriginid
                                    );
                                    if (idx !== -1) {
                                      const updatedField = {
                                        ...updatedProspect.prospectFieldsList[idx],
                                        value: fullPhone,
                                        fieldtext: fullPhone,
                                      };
                                      const updatedList = [...updatedProspect.prospectFieldsList];
                                      updatedList[idx] = updatedField;
                                      updatedProspect.prospectFieldsList = updatedList;
                                    }
                                  }
                                  updatedProspect.flatphone = fullPhone;
                                  try {
                                    setProspect(updatedProspect);
                                    setEditingFieldId(null);
                                    await saveProspect(updatedProspect);
                                  } catch (error) {
                                    console.error("Failed to save phone:", error);
                                  }
                                };
                                doSave();
                                return updated;
                              });
                            }, 0);
                          }}
                          onCancel={() => setEditingFieldId(null)}
                        />
                      ) : (
                        <div
                          className="field-value-row"
                          onClick={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="field-value-text">
                            {currentValue || <span className="empty-placeholder">No Phone</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // ── All other system fields: generic InlineEditField ──
                return (
                  <InlineEditField
                    key={field.fieldoriginid}
                    label={field.fieldname}
                    value={getDisplayValue(field, String(currentValue))}
                    isEditing={isEditing}
                    onEdit={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                    onSave={() => handleSave(field.fieldoriginid)}
                    editComponent={
                      renderFieldInput(
                        field,
                        editValues[field.fieldoriginid] || "",
                        (val) => handleEditChange(field.fieldoriginid, val)
                      )
                    }
                  />
                );
              })}

            {/* Show More Options Button (Only if no search query AND collapsed) */}
            {!searchQuery && !showCustomFields && prospect?.prospectFieldsList?.some((f: any) => f.iscustomfield) && (
              <div style={{ padding: "8px 0" }}>
                <Button
                  appearance="subtle"
                  onClick={() => setShowCustomFields(true)}
                  className="show-more-button"
                  style={{ paddingLeft: 0, fontWeight: "normal", color: "var(--colorBrandForeground1)" }}
                >
                  Show More Options
                </Button>
              </div>
            )}

            {/* Custom Fields (Visible if toggled ON or if Finding via Search) */}
            {(showCustomFields || searchQuery) && (
              <>
                {displayFields
                  .filter((field) => field.iscustomfield)
                  .map((field) => {
                    const currentValue = getFieldValue(field);
                    const isEditing = editingFieldId === field.fieldoriginid;
                    return (
                      <InlineEditField
                        key={field.fieldoriginid}
                        label={field.fieldname}
                        value={getDisplayValue(field, String(currentValue))}
                        isEditing={isEditing}
                        onEdit={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                        onSave={() => handleSave(field.fieldoriginid)}
                        editComponent={
                          renderFieldInput(
                            field,
                            editValues[field.fieldoriginid] || "",
                            (val) => handleEditChange(field.fieldoriginid, val)
                          )
                        }
                      />
                    );
                  })}

                {/* Show Less Options Button (Only if no search query AND expanded) */}
                {!searchQuery && showCustomFields && (
                  <div style={{ padding: "8px 0" }}>
                    <Button
                      appearance="subtle"
                      onClick={() => setShowCustomFields(false)}
                      className="show-more-button"
                      style={{ paddingLeft: 0, fontWeight: "normal", color: "var(--colorBrandForeground1)" }}
                    >
                      Show Less Options
                    </Button>
                  </div>
                )}
              </>
            )}
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
