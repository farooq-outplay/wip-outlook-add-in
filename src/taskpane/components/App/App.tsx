import React, { useEffect, useState } from "react";
import ProspectSection from "../ProspectSection/ProspectSection";
import { Mode } from "../../../utility/enums/common.enum";

import "./App.css";
import { getToken } from "../../../utility/authStorage";
import Login from "../Login/Login";
import ReadView from "../ReadView/ReadView";
import { useAppContext } from "../../../utility/store/AppContext";

const App: React.FC<{}> = () => {
  const { mode } = useAppContext();
  // const [prospect, setProspect] = useState({
  //   email: "",
  // });
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
  }, [mode]);

  return (
    <div className="app-container">
      {accessToken ? (
        mode === Mode.ReadMode ? (
          // <ProspectSection accessToken={accessToken} email={prospect.email} onClose={() => {}} />
          <ReadView />
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
