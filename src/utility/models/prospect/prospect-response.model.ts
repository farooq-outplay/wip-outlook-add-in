/* ============================
   Enums
============================ */

export enum ProspectFieldType {
  Text = 1,
  // extend if backend adds more
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
}

/* ============================
   Root API Response
============================ */

export interface ProspectResponse {
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

  prospectstatus?: number;
  lastmodifieddate?: string; // ISO string
  createddate?: string; // ISO string

  MarkAsMainAttribute?: boolean;
  hotleadstatus?: number;
}
