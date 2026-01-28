import * as React from "react";
import { Image } from "@fluentui/react-components";
import "./Header.css";

export interface HeaderProps {
  title: string;
  logo: string;
  message: string;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { title, logo, message } = props;

  return (
    <section className="welcome-header">
      <Image width="90" height="90" src={logo} alt={title} />
      <h1 className="welcome-message">{message}</h1>
    </section>
  );
};

export default Header;
