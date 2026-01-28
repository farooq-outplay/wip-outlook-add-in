import React from "react";
import { Button } from "@fluentui/react-components";
import {
  StarEmphasis24Regular,
  PeopleTeam24Regular,
  ContactCardGroup24Regular,
} from "@fluentui/react-icons";
import "./OnboardingPage.css";

interface OnboardingPageProps {
  onContinue: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onContinue }) => {
  const features = [
    {
      icon: <StarEmphasis24Regular />,
      text: "Instant access to contact and company insights",
    },
    {
      icon: <PeopleTeam24Regular />,
      text: "Easily manage follow-ups on Outplay",
    },
    {
      icon: <ContactCardGroup24Regular />,
      text: "Research contacts and companies directly from Outlook",
    },
  ];

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="brand-row">
          <img src="assets/outplay-logo.svg" alt="Outplay" className="brand-logo" />
          <div className="brand-name">
            Outplay.io
          </div>
        </div>

        <div>
          <h2 className="title-hero">Boost email productivity</h2>
          <p className="subtitle-brand">with Outplay</p>
        </div>

        <ul className="feature-list">
          {features.map((item, index) => (
            <li key={index} className="feature-item">
              <span className="feature-icon-wrapper">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <Button appearance="primary" className="cta-button" onClick={onContinue}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
