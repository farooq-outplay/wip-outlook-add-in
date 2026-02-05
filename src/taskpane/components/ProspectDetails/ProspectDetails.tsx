import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../utility/store/AppContext";
import { getProspectByEmail, saveProspect } from "../../../utility/api/prospectService";
import { getToken } from "../../../utility/authStorage";
import { Mode } from "../../../utility/enums/common.enum";
import {
  ProspectData,
  ProspectResponse,
} from "../../../utility/models/prospect/prospect-response.model";
import Loader from "../Loader/Loader";
import "./ProspectDetails.css";
import { ApiStatusCodes } from "../../../utility/types/apiResultTypes";
import SomethingWentWrong from "../SomethingWentWrong/SomethingWentWrong";
import ProspectSection from "../ProspectSection/ProspectSection";

const ProspectDetails: React.FC = () => {
  const { mode } = useAppContext();
  const [accessToken, setAccessToken] = useState<string | null>("");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSomethingWentWrong, setShowSomethingWentWrong] = useState<boolean>(false);

  const [prospect, setProspect] = useState<ProspectData | null>(null);

  const checkToken = async () => {
    try {
      const token = await getToken();
      setAccessToken(token);
    } catch (e) {
      console.error("Token read failed", e);
    } finally {
    }
  };

  useEffect(() => {
    checkToken();
    //
    if (mode !== Mode.ReadMode) return;

    const mailbox = Office?.context?.mailbox;
    const toRecipients = mailbox?.item?.to;

    const primaryRecipient =
      Array.isArray(toRecipients) && toRecipients.length > 0 ? toRecipients[0] : undefined;

    const fallbackFrom = mailbox?.item?.from;

    const emailAddress = primaryRecipient?.emailAddress || fallbackFrom?.emailAddress || "";

    if (emailAddress) {
      setEmail(emailAddress);
      getProspectInfoByEmail(emailAddress);
    }
  }, []);

  const getProspectInfoByEmail = async (email: string | number) => {
    try {
      const data: ProspectResponse = await getProspectByEmail(email);
      console.log("Data ::", data);

      if (data.success) {
        setShowSomethingWentWrong(false);
        setProspect(data.data);
      } else {
        setShowSomethingWentWrong(true);
      }
      setIsLoading(false);
    } catch (error) {
      setShowSomethingWentWrong(true);
      setIsLoading(false);
    }
  };

  const handleAddAsProspect = async () => {
    setIsLoading(true);
    const currentEmail = email;
    try {
      const payload = {
        emailid: currentEmail,
        prospectaccountid: null,
        firstname: "",
        lastname: "",
        designation: "",
        phone: null,
        phoneExtension: "",
        prospectfields: [],
      };
      const response = await saveProspect(payload);
      if (response.prospectid) {
        getProspectInfoByEmail(response.prospectid);
      }
    } catch (error) {
      console.error("Error saving prospect:", error);
    }
  };

  if (showSomethingWentWrong) {
    return <SomethingWentWrong />;
  }

  if (isLoading || !prospect) {
    return <Loader text="Loading prospect details..." />;
  }

  if (!prospect.prospectid) {
    return (
      <div className="add-as-p-container">
        <span className="add-as-p-text">No prospect found for this email.</span>
        <button className="add-as-p-button" onClick={handleAddAsProspect}>
          Add as Prospect
        </button>
      </div>
    );
  }
  return (
    <ProspectSection
      accessToken={accessToken || undefined}
      firstName={prospect?.firstname}
      lastName={prospect?.lastname}
      email={prospect?.emailid || ""}
    />
  );
};

export default ProspectDetails;
