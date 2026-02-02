import React, { useEffect, useState } from "react";
import ProspectSection from "../ProspectSection/ProspectSection";
import { Mode } from "../../../utility/enums/common.enum";

export interface AppProps {
  title?: string;
  mode?: number;
}

import "./App.css";
import { getToken } from "../../../utility/authStorage";
import Login from "../Login/Login";

const App: React.FC<AppProps> = ({ mode }) => {
  const [prospect, setProspect] = useState({
    email: "",
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkToken = async () => {
    try {
      const token = await getToken();
      setAccessToken(token);
    } catch (e) {
      console.error("Token read failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
    if (mode !== Mode.ReadMode) return;

    const mailbox = Office?.context?.mailbox;
    const toRecipients = mailbox?.item?.to;

    const primaryRecipient =
      Array.isArray(toRecipients) && toRecipients.length > 0 ? toRecipients[0] : undefined;

    const fallbackFrom = mailbox?.item?.from;

    const emailAddress = primaryRecipient?.emailAddress || fallbackFrom?.emailAddress || "";

    setProspect({ email: emailAddress });
  }, [mode]);

  return (
    <div className="app-container">
      {accessToken ? (
        mode === Mode.ReadMode ? (
          <ProspectSection accessToken={accessToken} email={prospect.email} onClose={() => {}} />
        ) : (
          <div>Coming Soon...</div>
        )
      ) : (
        <Login onLoginSuccess={setAccessToken} />
      )}
    </div>
  );
};

export default App;
