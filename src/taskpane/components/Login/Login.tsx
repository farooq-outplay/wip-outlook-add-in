import React, { useState } from "react";
import { Button, Checkbox, Input, Label } from "@fluentui/react-components";
import { Building20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import "./Login.css";
import { saveToken } from "../../../utility/authStorage";
import { clearAuthDialog, setAuthDialog } from "../../../utility/dialogManager";
import { LOGIN_URL } from "../../../utility/constants";

/* global Office */

interface DialogMessage {
  type: string;
  token?: string;
  message?: string;
}

const LOGIN_API = "http://localhost:44380/api/user/login";
type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
};

type Props = {
  onLoginSuccess: (token: string) => void;
};
const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const extractTokenFromRedirect = (url: string, key = "code") => {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get(key);
    } catch {
      return null;
    }
  };

  const fetchAccessToken = async (token: string) => {
    const res = await fetch(`https://localhost:44380/api/jwt/token?token=${token}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-OP-ClientId": "D4735D99-EFB0-4E55-8B70-100C70703DB",
        Authorization: `Bearer ${token}`,
        "X-Mobile-Platform": "ANDROID",
      },
    });
    const data = await res.json();
    return data;
  };

  const openLoginDialog = () => {
    Office.context.ui.displayDialogAsync(
      LOGIN_URL,
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
            console.log("Dialog message received:", arg.message);

            try {
              const data: DialogMessage = JSON.parse(arg.message);

              if (data.type === "AUTH_SUCCESS" && data.token) {
                const responseData = await fetchAccessToken(data.token);
                console.log("Authentication successful, token received.", responseData);
                // localStorage.setItem("accessToken", responseData.accessToken);
                setAccessToken(responseData.accessToken);
                onLoginSuccess(responseData.accessToken);
                await saveToken(responseData.accessToken);
                dialog.close();
                clearAuthDialog();
              }

              if (data.type === "AUTH_ERROR") {
                console.error("Auth failed:", data.message);
              }
            } catch (error) {
              console.error("Invalid dialog message:", arg.message, error);
            }
          } else {
            console.error("Dialog error:", arg.error);
          }
        });

        dialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          clearAuthDialog();
        });
      }
    );
  };

  return (
    <>
      <button onClick={openLoginDialog}>Login</button>
    </>
  );
};

export default Login;
