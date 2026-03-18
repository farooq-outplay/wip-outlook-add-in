import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Button,
  Text,
  Avatar,
  Link,
  Divider,
  Input,
  Tooltip,
  Textarea,
  Checkbox,
  Select,
  Dropdown,
  Option,
} from "@fluentui/react-components";

import {
  Clock20Regular,
  Search20Regular,
  Pulse20Regular,
  Share20Regular,
  Building20Regular,
  Dismiss20Regular,
  Edit20Regular,
  ChevronDown20Regular,
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
import { updateProspect, getProspectStages } from "../../../utility/api/prospectService";
import InlineEditField from "../InlineEditField/InlineEditField";
import TimezoneSelect, { ITimezone, ITimezoneOption, allTimezones } from "react-timezone-select";

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
  return fieldname.toLowerCase().replace(/\s+/g, "");
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

  const ft = typeof field.fieldtype === "string" ? field.fieldtype.toLowerCase() : field.fieldtype;
  if (ft === "prospect_date_time" || ft === 5) {
    const date = new Date(rawValue);
    return isNaN(date.getTime()) ? rawValue : date.toLocaleString();
  }

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

  const [datePickersVisible, setDatePickersVisible] = useState<Record<string, boolean>>({});

  // Stages State
  const [stages, setStages] = useState<any[]>([]);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const stageButtonRef = useRef<HTMLButtonElement | null>(null);
  const stageDropdownRef = useRef<HTMLDivElement | null>(null);

  // Modal State
  const [isAddToSequenceModalOpen, setIsAddToSequenceModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const displayFields = useMemo(() => {
    if (!prospect) return [];

    const allFields = prospect.prospectFieldsList || [];

    // 1. Build Predefined Fields, reusing original field objects when available
    const predefined: any[] = [];
    for (const [propertyKey, propertyValue] of Object.entries(predefinedFieldsNameForPin)) {
      if (!Number.isNaN(Number(propertyKey))) continue;

      let originalField = allFields.find(
        (f: any) => f.fieldoriginid === propertyValue && f.iscustomfield === false
      );
      if (originalField) {
        predefined.push({ ...originalField });
      } else {
        predefined.push({
          fieldoriginid: propertyValue,
          fieldorigin: 0,
          fieldname: propertyKey,
          iscustomfield: false,
          fieldtype: getFieldType(propertyKey),
        });
      }
    }

    // 2. Merge with remaining prospectFieldsList
    const predefinedIds = predefined.map((f) => f.fieldoriginid);
    const remainingFields = allFields.filter((f: any) => !predefinedIds.includes(f.fieldoriginid));

    let combined = [...predefined, ...remainingFields];

    // 3. Filter based on search query
    if (searchQuery) {
      combined = combined.filter(
        (field) =>
          field.fieldname && field.fieldname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return combined;
  }, [prospect, searchQuery]);

  useEffect(() => {
    setProspect(initialProspect);
  }, [initialProspect]);

  useEffect(() => {
    getProspectStages()
      .then((res) => {
        console.log("getProspectStages raw response:", res);
        if (res && res.success && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data.stageList ?? res.data.stages ?? res.data.data ?? []);
          setStages(list);
        } else if (Array.isArray(res)) {
          setStages(res);
        } else {
          console.warn("Unexpected stages shape:", res);
        }
      })
      .catch((err) => console.error("Error fetching stages", err));
  }, []);

  const handleStageChange = useCallback(
    async (stage: any) => {
      const stageId = stage.id ?? stage.prospectstageid ?? stage.value ?? stage.guid;
      const stageName = stage.name ?? stage.prospectstage ?? stage.label;

      if (!stageId || !stageName) {
        console.warn("Invalid stage selected", stage);
        return;
      }

      // Optimistic local update
      const updatedProspect = { ...prospect, prospectstage: stageName, prospectstageid: stageId };
      setProspect(updatedProspect);

      try {
        // Create stage payload exactly as expected by the backend format
        const payload: any = {
          prospectid: prospect.prospectid,
          fieldorigin: 0,
          fieldoriginid: 8,
          value: String(stageId),
        };

        console.log("updateProspect stage payload:", payload);
        const response = await updateProspect(payload);
        console.log("updateProspect stage response:", response);

        if (response && response.success === false) {
          console.error("Stage update failed:", response.error);
          setProspect(prospect); // revert
        }
      } catch (error) {
        console.error("Failed to update prospect stage:", error);
        setProspect(prospect); // Revert optimistic update
      }
    },
    [prospect]
  );

  // Close stage dropdown when clicking outside (exclude the portal list itself)
  useEffect(() => {
    if (!stageDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = stageButtonRef.current?.contains(target);
      const insideDropdown = stageDropdownRef.current?.contains(target);
      if (!insideButton && !insideDropdown) {
        setStageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [stageDropdownOpen]);

  const openStageDropdown = () => {
    setStageDropdownOpen((prev) => !prev);
  };

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
    if (key === "designation" || key === "title")
      return prospect.designation || prospect.title || "";
    if (key === "timezone") return prospect.ianatimezone || "";
    if (key === "prospectaccount" || key === "company")
      return prospect.prospectaccount || prospect.company || "";
    if (key === "prospectstage") return prospect.prospectstage || prospect.stage || "";
    if (key === "owner") return prospect.owner || "";

    // 2. Check prospectFieldsList
    if (prospect.prospectFieldsList) {
      // Try ID match first
      const fieldItem = prospect.prospectFieldsList.find(
        (f: any) => f.fieldoriginid === field.fieldoriginid
      );
      if (fieldItem) {
        return fieldItem.fieldtext ?? fieldItem.value ?? "";
      }

      // Try Name match
      const fieldItemByName = prospect.prospectFieldsList.find(
        (f: any) => f.fieldname && f.fieldname.toLowerCase() === field.fieldname.toLowerCase()
      );
      if (fieldItemByName) {
        return fieldItemByName.fieldtext ?? fieldItemByName.value ?? "";
      }
    }

    // 3. Fallback checks for old hardcoded keys/dates
    if (key === "sdrfirsttouchdate")
      return (
        prospect.sdrfirsttouchdate ||
        prospect.firsttouchdate ||
        prospect.prospectDetails?.firsttouchdate ||
        ""
      );
    if (key === "createddate") return prospect.createddate || "";
    if (key === "lastcontacteddate")
      return (
        prospect.lastcontacteddate ||
        prospect.lasttouchdate ||
        prospect.prospectDetails?.lasttouchdate ||
        ""
      );
    if (key === "lastmodifieddate") return prospect.lastmodifieddate || "";

    // General fallback
    if (prospect[key]) return prospect[key];
    if (prospect[field.fieldname]) return prospect[field.fieldname];

    return "";
  };

  const renderFieldInput = (field: any, currentValue: string, onChange: (val: string) => void) => {
    // Force fieldtype to lowercase string for robust matching
    const ft =
      typeof field.fieldtype === "string" ? field.fieldtype.toLowerCase() : field.fieldtype;

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
          className="input-full-width no-calendar-icon"
          ref={(input) => input?.showPicker?.()}
        />
      );
    }
    if (ft === "prospect_date_time" || ft === 5) {
      return (
        <Input
          {...commonInputProps}
          type="datetime-local"
          className="input-full-width no-calendar-icon"
        />
      );
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
      // TODO: replace with real API data
      const dummyDropdownOptions = [
        { key: "option1", text: "Option 1" },
        { key: "option2", text: "Option 2" },
        { key: "option3", text: "Option 3" },
        { key: "option4", text: "Option 4" },
      ];

      return (
        <Dropdown
          {...commonInputProps}
          value={
            dummyDropdownOptions.find((opt) => opt.key === currentValue)?.text || currentValue || ""
          }
          selectedOptions={currentValue ? [currentValue] : []}
          onOptionSelect={(_e: any, data: any) => {
            if (data.optionValue) {
              onChange(data.optionValue);
            }
          }}
          onChange={undefined} // Prevent generic onChange from conflicting with Dropdown
          className="input-full-width field-select"
        >
          {dummyDropdownOptions.map((opt) => (
            <Option key={opt.key} value={opt.key}>
              {opt.text}
            </Option>
          ))}
        </Dropdown>
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

    // ── Timezone (fieldoriginid = 6) ──
    if (field.fieldoriginid === 6) {
      return (
        <TimezoneSelect
          value={prospect?.ianatimezone || ""}
          onChange={(tz: ITimezoneOption) => onChange(tz.value)}
          placeholder="Search timezone..."
          labelStyle="original"
          className="full-width"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      );
    }

    // ── Default: Text input (fieldtype 1 or prospect_text or unknown) ──
    return <Input {...commonInputProps} type="text" />;
  };

  const handleEditStart = (fieldId: number, currentValue: string) => {
    setEditingFieldId(fieldId);
    setEditValues((prev) => ({ ...prev, [fieldId]: currentValue }));
  };

  const handleEditChange = (fieldId: number, newValue: string) => {
    setEditValues((prev) => ({ ...prev, [fieldId]: newValue }));
  };

  const handleSave = async (fieldId: number, overrideValue?: string) => {
    const newValue = overrideValue !== undefined ? overrideValue : editValues[fieldId];
    // If no change or undefined, just exit
    if (newValue === undefined) {
      setEditingFieldId(null);
      return;
    }

    // 1. Create a shallow copy of prospect
    const updatedProspect = { ...prospect };

    // 2. Find the field config to know what we are updating
    const fieldConfig = displayFields.find((f) => f.fieldoriginid === fieldId);

    if (!fieldConfig) {
      console.error("Field config not found for id:", fieldId);
      setEditingFieldId(null);
      return;
    }

    const finalFieldOrigin = fieldConfig.fieldorigin ?? (fieldConfig.iscustomfield ? 2 : 1);
    const finalFieldType = fieldConfig.fieldtype ?? 1;

    if (finalFieldOrigin === null || finalFieldOrigin === undefined) {
      throw new Error("Validation Error: fieldorigin is null or undefined");
    }
    if (finalFieldType === null || finalFieldType === undefined) {
      throw new Error("Validation Error: fieldtype is null or undefined");
    }
    if (fieldConfig.fieldoriginid === null || fieldConfig.fieldoriginid === undefined) {
      throw new Error("Validation Error: fieldoriginid is null or undefined");
    }

    const payload: any = {
      prospectid: prospect.prospectid,
      fieldorigin: finalFieldOrigin,
      fieldoriginid: fieldConfig.fieldoriginid,
      fieldtype: finalFieldType,
      value: newValue,
      alternatename: null,
      extravalue: null,
      ianatimezone: null,
      timezone: null,
    };

    console.log("updateProspect payload:", payload);

    // 3. Keep optimistic local state update logic unchanged

    // Always try to update in prospectFieldsList if the field exists there (handles both custom and system fields in the list)
    if (updatedProspect.prospectFieldsList) {
      const fieldIndex = updatedProspect.prospectFieldsList.findIndex(
        (f: any) => f.fieldoriginid === fieldId
      );
      if (fieldIndex !== -1) {
        // Create copy of the field object
        const updatedField = {
          ...updatedProspect.prospectFieldsList[fieldIndex],
          value: newValue,
          fieldtext: newValue,
        }; // Optimistic update of text
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
      else if (key === "prospectaccount" || key === "company")
        updatedProspect.prospectaccount = newValue;
      else if (key === "timezone") updatedProspect.ianatimezone = newValue;
      else if (key === "prospectstage")
        updatedProspect.prospectstage = newValue; // check API expectation for this?
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

      // const { updateProspect } = require("../../../utility/api/prospectService"); // Inline import to avoid circular dep if any, or just convenience
      await updateProspect(payload);
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

  // allTimezones value is a plain city-names string (e.g. "Kolkata").
  // We build a richer label; if the key isn't in the map fall back to the
  // raw IANA string so we always show something when data exists.
  const rawIana = prospect?.ianatimezone || prospect?.timezone || "";
  const cityLabel = rawIana ? (allTimezones as Record<string, string>)[rawIana] : undefined;
  const timezoneLabel = rawIana
    ? cityLabel
      ? `${rawIana.replace(/_/g, " ")} (${cityLabel})`
      : rawIana
    : null;

  const openAddTaskDialog = () => {
    if (!prospect?.prospectid) {
      console.error("Cannot open task dialog: prospectid is missing");
      return;
    }

    console.log("Opening task dialog for prospectid:", prospect.prospectid);

    Office.context.ui.displayDialogAsync(
      window.location.origin + "/dialog.html?dialog=addTask&prospectid=" + prospect.prospectid,
      { height: 85, width: 40, displayInIframe: true },
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

  const openSendMessageDialog = () => {
    const prospectName = prospect
      ? [prospect.firstname, prospect.lastname].filter(Boolean).join(" ")
      : "";
    const url = new URL("/dialog.html", window.location.origin);
    url.searchParams.set("dialog", "sendMessage");
    if (prospectName) {
      url.searchParams.set("prospectName", prospectName);
    }
    if (prospect?.prospectid) {
      url.searchParams.set("prospectid", prospect.prospectid);
    }

    Office.context.ui.displayDialogAsync(
      url.toString(),
      { height: 70, width: 35, displayInIframe: true },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Failed to open dialog: " + asyncResult.error.message);
        } else {
          const dialog = asyncResult.value;

          // Handle messages from the dialog (e.g. submit or close button)
          dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
            let message;
            try {
              message = JSON.parse(arg.message);
            } catch (e) {
              message = arg.message;
            }

            if (message.status === "closed") {
              dialog.close();
            } else if (message.status === "submitted") {
              console.log("Sending SMS:", message.data);
              dialog.close();
            }
          });

          // Handle external dialog close (e.g. user clicks X)
          dialog.addEventHandler(Office.EventType.DialogEventReceived, (arg: any) => {
            // 12006: DialogClosedByUser
            if (arg.error === 12006) {
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
      <div className="timezone-row" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Clock20Regular />
        <span style={{ color: prospect?.ianatimezone ? "inherit" : "#999" }}>
          {timezoneLabel || "No Timezone"}
        </span>
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
            onClick={() => {}}
          />
        </Tooltip>
        <Tooltip content="Call" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faPhone} size="sm" className="icon-phone" />}
            className="action-button"
            onClick={() => {}}
          />
        </Tooltip>
        <Tooltip content="Text Message" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faCommentDots} size="sm" className="icon-comment" />}
            className="action-button"
            onClick={openSendMessageDialog}
          />
        </Tooltip>
        <Tooltip content="WhatsApp" relationship="label">
          <Button
            appearance="subtle"
            icon={<FontAwesomeIcon icon={faWhatsapp} size="sm" className="icon-whatsapp" />}
            className="action-button"
            onClick={() => {
              const phoneNumber = prospect?.flatphone || prospect?.phone || prospect?.mobile || "";
              if (phoneNumber) {
                const encodedPhone = encodeURIComponent(phoneNumber);
                const whatsappUrl = `https://api.whatsapp.com/send/?phone=${encodedPhone}&text=&type=phone_number&app_absent=0`;
                window.open(whatsappUrl, "_blank");
              }
            }}
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
        <Button appearance="secondary" className="pill-button" onClick={() => {}}>
          Bounced
        </Button>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            ref={stageButtonRef}
            className="pill-button fui-Button fui-Button--secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              border: "1px solid var(--colorNeutralStroke1)",
              borderRadius: 4,
              padding: "0 8px",
              height: 24,
              fontSize: "var(--fontSizeBase200)",
              background: "var(--colorNeutralBackground1)",
              color: "var(--colorNeutralForeground1)",
            }}
            onClick={openStageDropdown}
          >
            {prospect?.prospectstage || "No Stage"}
            <ChevronDown20Regular style={{ fontSize: 12, marginLeft: 2 }} />
          </button>

          {stageDropdownOpen && (
            <div
              ref={stageDropdownRef}
              style={{
                position: "absolute",
                top: "calc(100% + 2px)",
                left: 0,
                width: 260,
                zIndex: 9999,
                background: "#fff",
                border: "1px solid #d1d1d1",
                borderRadius: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                maxHeight: 260,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {stages.length === 0 ? (
                <div style={{ padding: "8px 12px", color: "#888", fontSize: 12 }}>
                  No stages available
                </div>
              ) : (
                stages.map((stage, idx) => {
                  const stageId =
                    stage.id ?? stage.prospectstageid ?? stage.value ?? stage.guid ?? idx;
                  const stageName = stage.name ?? stage.prospectstage ?? stage.label ?? "Unknown";
                  return (
                    <div
                      key={stageId}
                      onMouseDown={(e) => {
                        // Prevent the document mousedown from closing the dropdown
                        e.stopPropagation();
                        handleStageChange(stage);
                        setStageDropdownOpen(false);
                      }}
                      style={{
                        padding: "7px 16px",
                        cursor: "pointer",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 400,
                        color: "#333",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {stageName}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Social media icons row */}
      <div className="social-row">
        {isSearchOpen ? (
          <div className="search-input-container search-input-container-no-margin">
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
                  onClick={() => {}}
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
                  onClick={() => {}}
                  aria-label="Share"
                />
              </Tooltip>
              <Tooltip content="Twitter" relationship="label">
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

                                  const finalFieldOrigin =
                                    field.fieldorigin ?? (field.iscustomfield ? 2 : 1);
                                  // Normalise fieldtype: the phone field is stored as the string "phone" by getFieldType().
                                  // The API expects a numeric fieldtype, so coerce any non-numeric string to 1 (text).
                                  const rawFieldType = field.fieldtype ?? 1;
                                  const finalFieldType =
                                    typeof rawFieldType === "string" && isNaN(Number(rawFieldType))
                                      ? 1
                                      : rawFieldType;

                                  if (finalFieldOrigin === null || finalFieldOrigin === undefined) {
                                    throw new Error(
                                      "Validation Error: fieldorigin is null or undefined"
                                    );
                                  }
                                  if (finalFieldType === null || finalFieldType === undefined) {
                                    throw new Error(
                                      "Validation Error: fieldtype is null or undefined"
                                    );
                                  }
                                  if (
                                    field.fieldoriginid === null ||
                                    field.fieldoriginid === undefined
                                  ) {
                                    throw new Error(
                                      "Validation Error: fieldoriginid is null or undefined"
                                    );
                                  }

                                  const payload: any = {
                                    prospectid: prospect.prospectid,
                                    fieldorigin: finalFieldOrigin,
                                    fieldoriginid: field.fieldoriginid,
                                    fieldtype: finalFieldType,
                                    value: fullPhone,
                                    alternatename: null,
                                    extravalue: null,
                                    ianatimezone: null,
                                    timezone: null,
                                  };

                                  console.log("updateProspect payload:", payload);

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
                                    await updateProspect(payload);
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

                // Helper for date overlay
                const renderDateOverlay = () => {
                  const ft =
                    typeof field.fieldtype === "string"
                      ? field.fieldtype.toLowerCase()
                      : field.fieldtype;
                  if (ft !== "prospect_date" && ft !== 3 && ft !== "prospect_date_time" && ft !== 5)
                    return undefined;

                  const isDateTime = ft === "prospect_date_time" || ft === 5;
                  const type = isDateTime ? "datetime-local" : "date";
                  const val = isDateTime ? currentValue : toDateInputValue(String(currentValue));

                  return (
                    <input
                      type={type}
                      className="invisible-date-input"
                      value={val || ""}
                      onChange={(e) => {
                        handleSave(field.fieldoriginid, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      title={`Edit ${field.fieldname}`}
                    />
                  );
                };

                // ── All other system fields: generic InlineEditField ──
                return (
                  <InlineEditField
                    key={field.fieldoriginid}
                    label={field.fieldname}
                    value={getDisplayValue(field, String(currentValue))}
                    copyValue={String(currentValue)}
                    isEditing={isEditing}
                    onEdit={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                    onSave={() => handleSave(field.fieldoriginid)}
                    overlayComponent={renderDateOverlay()}
                    editComponent={renderFieldInput(
                      field,
                      editValues[field.fieldoriginid] || "",
                      (val) => handleEditChange(field.fieldoriginid, val)
                    )}
                  />
                );
              })}

            {/* Show More Options Button (Only if no search query AND collapsed) */}
            {!searchQuery && !showMoreOptions && (
              <div className="show-more-options-container">
                <Button
                  appearance="subtle"
                  onClick={() => setShowMoreOptions(true)}
                  className="show-more-button"
                >
                  Show More Options
                </Button>
              </div>
            )}

            {/* Custom Fields (Visible if toggled ON or if Finding via Search) */}
            {(showMoreOptions || searchQuery) && (
              <>
                {displayFields
                  .filter((field) => field.iscustomfield)
                  .map((field) => {
                    const currentValue = getFieldValue(field);
                    const isEditing = editingFieldId === field.fieldoriginid;
                    // Helper for date overlay
                    const renderDateOverlay = () => {
                      const ft =
                        typeof field.fieldtype === "string"
                          ? field.fieldtype.toLowerCase()
                          : field.fieldtype;
                      if (
                        ft !== "prospect_date" &&
                        ft !== 3 &&
                        ft !== "prospect_date_time" &&
                        ft !== 5
                      )
                        return undefined;

                      const isDateTime = ft === "prospect_date_time" || ft === 5;
                      const type = isDateTime ? "datetime-local" : "date";
                      const val = isDateTime
                        ? currentValue
                        : toDateInputValue(String(currentValue));

                      return (
                        <input
                          type={type}
                          className="invisible-date-input"
                          value={val || ""}
                          onChange={(e) => {
                            handleSave(field.fieldoriginid, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          title={`Edit ${field.fieldname}`}
                        />
                      );
                    };

                    return (
                      <InlineEditField
                        key={field.fieldoriginid}
                        label={field.fieldname}
                        value={getDisplayValue(field, String(currentValue))}
                        copyValue={String(currentValue)}
                        isEditing={isEditing}
                        onEdit={() => handleEditStart(field.fieldoriginid, String(currentValue))}
                        onSave={() => handleSave(field.fieldoriginid)}
                        overlayComponent={renderDateOverlay()}
                        editComponent={renderFieldInput(
                          field,
                          editValues[field.fieldoriginid] || "",
                          (val) => handleEditChange(field.fieldoriginid, val)
                        )}
                      />
                    );
                  })}

                {/* Default System Fields */}
                <div className="system-fields-section">
                  {[
                    {
                      label: "SDR First Touch Date",
                      value:
                        prospect?.sdrfirsttouchdate ||
                        prospect?.firsttouchdate ||
                        prospect?.prospectDetails?.firsttouchdate,
                    },
                    { label: "Created Date", value: prospect?.createddate },
                    {
                      label: "Last Contacted Date",
                      value:
                        prospect?.lastcontacteddate ||
                        prospect?.lasttouchdate ||
                        prospect?.prospectDetails?.lasttouchdate,
                    },
                    { label: "Last Modified Date", value: prospect?.lastmodifieddate },
                  ].map((sysField) => (
                    <div className="field-container" key={sysField.label}>
                      <Text className="field-label">{sysField.label}</Text>
                      <div className="field-display-row">
                        <div className="field-value-box">
                          <span className="field-value-text">{formatDate(sysField.value)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show Less Options Button (Only if no search query AND expanded) */}
                {!searchQuery && showMoreOptions && (
                  <div className="show-more-options-container">
                    <Button
                      appearance="subtle"
                      onClick={() => setShowMoreOptions(false)}
                      className="show-more-button"
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
            <Text className="info-title">Coming soon</Text>
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
