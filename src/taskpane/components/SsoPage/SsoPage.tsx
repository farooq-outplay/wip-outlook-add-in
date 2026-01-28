import React from "react";
import { Button, Checkbox, Input, Label } from "@fluentui/react-components";
import { Building20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import "./SsoPage.css";

const googleLogo = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";
const microsoftLogo =
  "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg";

const SsoPage: React.FC = () => {

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="sso-page">
      <div className="sso-card">
        <div className="brand-row">
          <img src="assets/outplay-logo.svg" alt="Outplay" className="brand-logo" />
          <div>
            <div className="brand-text">Outplay</div>
            <p className="sso-subtitle">Outplay</p>
          </div>
        </div>

        <div className="sso-stack">
          <p className="muted-label">Continue with</p>
          <button className="sso-button" type="button">
            <span className="icon-circle">
              <img src={googleLogo} alt="Google" width={18} height={18} />
            </span>
            Log In with Google
          </button>
          <button className="sso-button" type="button">
            <span className="icon-circle">
              <img src={microsoftLogo} alt="Microsoft" width={18} height={18} />
            </span>
            Log In with Microsoft
          </button>
          <button className="sso-button" type="button">
            <span className="icon-circle">
              <Building20Regular />
            </span>
            Log In with your Organization
          </button>
        </div>

        <div className="sso-divider">
          <div className="divider-line" />
          <span className="divider-text">OR</span>
          <div className="divider-line" />
        </div>

        <form className="field-group" onSubmit={handleSubmit}>
          <div>
            <Label className="label-row">Email</Label>
            <Input
              type="email"
              placeholder="Work Email"
              className="input-full"
              appearance="outline"
            />
          </div>
          <div className="password-row">
            <Label className="label-row">Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              className="input-full"
              appearance="outline"
            />
            <LockClosed20Regular className="lock-icon" />
          </div>
          <div className="checkbox-row">
            <Checkbox label="Keep me signed in" defaultChecked />
          </div>
          <Button appearance="primary" className="primary-button" type="submit">
            Log In
          </Button>
        </form>

        <p className="helper-text">
          Forgot your password?{" "}
          <a className="helper-link" href="#" aria-label="Reset password">
            Reset It Here
          </a>
        </p>

        <p className="legal-text">
          2025 All Rights Reserved.
          <br />
          Privacy and Terms.
        </p>
      </div>
    </div>
  );
};

export default SsoPage;
