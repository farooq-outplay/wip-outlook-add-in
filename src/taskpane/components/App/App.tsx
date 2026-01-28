import React, { useEffect, useState } from "react";
import OnboardingPage from "../OnboardingPage/OnboardingPage";
import SsoPage from "../SsoPage/SsoPage";
import ProspectSection from "../ProspectSection/ProspectSection";
import { Mode } from "../../../utility/common.enum";

export interface AppProps {
  title?: string;
  mode?: number;
}

import "./App.css";

const App: React.FC<AppProps> = ({ mode }) => {
  const [prospect, setProspect] = useState({
    email: "",
  });

  useEffect(() => {
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
      {/* 1️⃣ Onboarding UI */}
      <OnboardingPage onContinue={() => { }} />

      {/* 2️⃣ SSO UI */}
      <SsoPage />

      {/* 3️⃣ Prospect Section UI */}
      <ProspectSection email={prospect.email} onClose={() => { }} />
    </div>
  );
};

export default App;
