import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../utility/store/AppContext";
import { getProspectByEmail } from "../../../utility/api/prospectService";
import { getToken } from "../../../utility/authStorage";
import { Mode } from "../../../utility/enums/common.enum";

interface Prospect {
  emailid?: string;
  firstname?: string;
  lastname?: string;
  status?: string;
  prospectstatus?: string;
}

const ProspectDetails: React.FC = () => {
  const { mode } = useAppContext();
  const [accessToken, setAccessToken] = useState<string | null>("");

  const [prospect, setProspect] = useState<Prospect | null>(null);

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
      getProspectInfoByEmail(emailAddress);
    }
  }, []);

  const getProspectInfoByEmail = async (email: string) => {
    try {
      const data = await getProspectByEmail(email, accessToken ?? "");
      setProspect(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!prospect) {
    return <div>Loading Prospect Details...</div>;
  }
  return (
    <div className="card">
      <h3>Prospect Details</h3>

      <div className="prospect-row">
        <b>Name:</b> {prospect?.firstname} {prospect?.lastname}
      </div>

      <div className="prospect-row">
        <b>Email:</b> {prospect?.emailid}
      </div>

      <div className="prospect-row">
        <b>Status:</b> {prospect?.prospectstatus}
      </div>
    </div>
  );
};

export default ProspectDetails;
