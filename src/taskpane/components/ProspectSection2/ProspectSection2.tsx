import React, { useEffect, useState, useMemo } from "react";
import { Button, Text, Avatar, Link, Divider, Input, Tooltip } from "@fluentui/react-components";

import {
  Clock20Regular,
  Search20Regular,
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
} from "@fortawesome/free-solid-svg-icons";

import "./ProspectSection2.css";
import MoreOptionsMenu from "../MoreOptionsMenu/MoreOptionsMenu";

interface ProspectSectionProps {
  prospect?: any;
}

const ProspectSection2: React.FC<ProspectSectionProps> = ({ prospect }) => {
  const [activeTab, setActiveTab] = useState<"info" | "activity">("info");

  // 🔹 search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 🔹 single source of truth
  const [prospectDetailsObj, setProspectDetailsObj] = useState<any>(prospect);

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

  // ✅ prepare fields when prospect changes
  useEffect(() => {
    if (!prospect) return;

    const tempArr: any[] = [];

    for (const [propertyKey, propertyValue] of Object.entries(predefinedFieldsNameForPin)) {
      if (!Number.isNaN(Number(propertyKey))) continue;

      tempArr.push({
        fieldoriginid: propertyValue,
        fieldorigin: 0,
        fieldname: propertyKey,
        iscustomfield: false,
      });
    }

    const updatedFieldsList = [
      ...tempArr,
      ...(prospect?.prospectFieldsList || []),
      { fieldname: "tags", iscustomfield: false },
      { fieldname: "datedetails", iscustomfield: false },
    ];

    setProspectDetailsObj({
      ...prospect,
      prospectFieldsList: updatedFieldsList,
    });
  }, [prospect]);

  // ✅ derived filtering (BEST PRACTICE)
  const filteredFields = useMemo(() => {
    const list = prospectDetailsObj?.prospectFieldsList || [];
    const q = searchQuery.trim().toLowerCase();

    if (!q) return list;

    return list.filter((field: any) => field?.fieldname?.toLowerCase()?.includes(q));
  }, [prospectDetailsObj?.prospectFieldsList, searchQuery]);

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  // 🔹 header helpers
  const fullName =
    (prospectDetailsObj?.firstname || "") + " " + (prospectDetailsObj?.lastname || "");

  const domain = prospectDetailsObj?.domain || "";

  const initials = fullName
    ? fullName
        .trim()
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : "";

  return (
    <section className="prospectDetailsObj-section">
      {/* Header */}
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

      {/* Company row */}
      {domain && (
        <div className="company-row">
          <Building20Regular />
          <Link href={`https://${domain}`} target="_blank" className="domain-link">
            {domain}
          </Link>
        </div>
      )}

      {/* Timezone */}
      <div className="timezone-row">
        <Clock20Regular />
        <span>{prospectDetailsObj?.timezone || "No Timezone"}</span>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <Tooltip content="Add to Sequence" relationship="label">
          <Button appearance="subtle" icon={<FontAwesomeIcon icon={faPaperPlane} size="sm" />} />
        </Tooltip>

        <Tooltip content="Send Email" relationship="description">
          <Button appearance="subtle" icon={<FontAwesomeIcon icon={faEnvelope} size="sm" />} />
        </Tooltip>

        <Tooltip content="Add Task" relationship="label">
          <Button appearance="subtle" icon={<FontAwesomeIcon icon={faListCheck} size="sm" />} />
        </Tooltip>

        <MoreOptionsMenu
          onPause={() => {}}
          onMarkFinished={() => {}}
          onOptOut={() => {}}
          onDelete={() => {}}
          onLogCall={() => {}}
        />
      </div>

      {/* 🔍 Search */}
      <div className="social-row">
        {isSearchOpen ? (
          <div className="search-input-container" style={{ marginLeft: 0 }}>
            <Input
              autoFocus
              value={searchQuery}
              onChange={(_e, data) => setSearchQuery(data.value)}
              placeholder="Search Prospect Fields"
              contentBefore={<Search20Regular />}
              contentAfter={
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  onClick={handleSearchClear}
                />
              }
            />
          </div>
        ) : (
          <Tooltip content="Search" relationship="label">
            <Button
              appearance="subtle"
              icon={<Search20Regular />}
              onClick={() => setIsSearchOpen(true)}
            />
          </Tooltip>
        )}
      </div>

      <Divider className="divider" />

      {/* Tabs */}
      <div className="utility-bar">
        <Button
          appearance="subtle"
          icon={<FontAwesomeIcon icon={faCircleInfo} />}
          onClick={() => setActiveTab("info")}
        />
      </div>

      {/* ✅ CONTENT */}
      <div className="scrollable-content">
        {activeTab === "info" && (
          <div className="info-container">
            {filteredFields.map((field: any, index: number) => (
              <div key={`${field.fieldname}-${index}`}>
                <div style={{ fontWeight: "bold" }}>
                  {field.fieldname} - {index}
                </div>
                <div>{field.fieldtext}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="info-container">
            <Text>No recent activity</Text>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProspectSection2;
