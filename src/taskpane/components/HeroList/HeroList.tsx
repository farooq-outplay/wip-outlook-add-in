import * as React from "react";
import "./HeroList.css";

export interface HeroListItem {
  icon: React.JSX.Element;
  primaryText: string;
}

export interface HeroListProps {
  message: string;
  items: HeroListItem[];
}

const HeroList: React.FC<HeroListProps> = (props: HeroListProps) => {
  const { items, message } = props;

  const listItems = items.map((item, index) => (
    <li className="hero-list-item" key={index}>
      <i className="hero-icon">{item.icon}</i>
      <span className="hero-item-text">{item.primaryText}</span>
    </li>
  ));
  return (
    <div className="hero-main">
      <h2 className="hero-message">{message}</h2>
      <ul className="hero-list">{listItems}</ul>
    </div>
  );
};

export default HeroList;
