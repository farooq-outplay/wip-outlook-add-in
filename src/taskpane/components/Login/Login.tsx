import React from "react";
import { saveToken } from "../../../utility/authStorage";
import { setAuthDialog, clearAuthDialog } from "../../../utility/dialogManager";
import { exchangeAuthToken } from "../../../utility/api/authService";
import { getLoginUrl } from "../../../utility/auth.constants";
import { saveAuthSession } from "../../../utility/authSession";
import "./Login.css";

/* global Office */

type Props = {
  onLoginSuccess?: (token: string) => void;
};
const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const openLoginDialog = () => {
    const loginUrl = getLoginUrl();
    Office.context.ui.displayDialogAsync(
      loginUrl,
      { height: 60, width: 30, promptBeforeOpen: false },
      (result) => {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          console.error("Dialog open failed", result.error);
          return;
        }

        const dialog = result.value;

        // ✅ store dialog globally
        setAuthDialog(dialog);

        dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg) => {
          console.log("Dialog message received:", arg);
          if ("message" in arg) {
            try {
              const data = JSON.parse(arg.message);

              if (data.type === "AUTH_SUCCESS" && data.token) {
                const response = await exchangeAuthToken(data.token);
                saveAuthSession(response);

                await saveToken(response.accessToken);
                onLoginSuccess?.(response.accessToken);

                dialog.close();
                clearAuthDialog();
              }

              if (data.type === "AUTH_ERROR") {
                console.error("Login failed:", data.message);
              }
            } catch (e) {
              console.error("Invalid dialog message", e);
            }
          } else {
            console.error("Dialog error:", arg.error);
          }
        });

        dialog.addEventHandler(Office.EventType.DialogEventReceived, (arg) => {
          console.warn("Dialog closed:", "error" in arg ? arg.error : "Unknown error");
          clearAuthDialog();
        });
      }
    );
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <img src="/assets/outplay-logo.svg" alt="Outplay" />
        </div>

        <button className="login-button" onClick={openLoginDialog}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
