import React from "react";
import "./SomethingWentWrong.css";

type SomethingWentWrongProps = {
  text?: string;
};

const SomethingWentWrong: React.FC<SomethingWentWrongProps> = ({
  text = "Something went wrong...",
}) => {
  return (
    <div className="loader-container">
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default SomethingWentWrong;
