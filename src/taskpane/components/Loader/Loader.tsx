import React from "react";
import "./Loader.css";

type LoaderProps = {
  text?: string;
};

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
