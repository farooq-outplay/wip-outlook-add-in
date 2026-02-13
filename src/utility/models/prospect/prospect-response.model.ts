/* ============================
   Enums
============================ */

export enum ProspectFieldType {
  Text = 1,
  // Custom Field Types
  prospect_date = "prospect_date",
  prospect_date_time = "prospect_date_time",
  prospect_dropdown = "prospect_dropdown",
  prospect_lookup = "prospect_lookup",
  prospect_multi_line = "prospect_multi_line",
  prospect_number = "prospect_number",
  prospect_pick_list = "prospect_pick_list",
  prospect_text = "prospect_text",
  prospect_url = "prospect_url",
}

export enum EmailStatus {
  Invalid = 0,
  Verified = 1,
  Bounced = 2,
  Active = 3,
}

/* ============================
   Sub Models
============================ */

export interface ProspectField {
  fieldoriginid?: number;
  fieldname?: string;
  fieldtype?: ProspectFieldType;
  iscustomfield?: boolean;
  value?: string;
}

export interface ProspectEmail {
  id?: number;
  name?: string;
  email?: string;
  status?: EmailStatus;
}

export interface ProspectDetails {
  prospectID?: number;
  taskCurrentlyShowing?: number;
  taskview?: number;
  IsTask?: boolean;
  sequenceID?: number;
  sequenceStepID?: number;
  steporder?: number;
  firsttouchdate?: string;
  lasttouchdate?: string;
}

/* ============================
   Root API Response
============================ */

export interface ProspectData {
  domain?: string;
  tags?: string[];
  prospectOportunityIds?: number[];

  prospectFieldsList?: ProspectField[];

  primaryEmail?: ProspectEmail;
  alternateEmailsList?: ProspectEmail[];
  alternatePhonesList?: string[];

  prospectDetails?: ProspectDetails;

  prospectstage?: string;
  CRMObjectDetails?: unknown[];

  setid?: number;
  potentialduplicatesetid?: number;
  HasEditAccess?: boolean;

  prospectid?: number;
  userid?: number;

  emailid?: string;
  firstname?: string;
  lastname?: string;
  flatphone?: string;

  prospectaccount?: string;
  prospectowner?: string;
  designation?: string;

  firsttouchdate?: string;
  lasttouchdate?: string;
  sdrfirsttouchdate?: string;
  lastcontacteddate?: string;

  prospectstatus?: number;
  lastmodifieddate?: string; // ISO string
  createddate?: string; // ISO string

  MarkAsMainAttribute?: boolean;
  hotleadstatus?: number;
}

export type ProspectResponse =
  | { success: true; data: ProspectData }
  | { success: false; status: number; error: string };
