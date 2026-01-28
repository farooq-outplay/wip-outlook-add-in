import React, { useState } from "react";
import "./Tooltip.css";

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    position?: "top"; // Only top supported for now based on requirements, but extensible
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="tooltip-container"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div className={`tooltip-box ${isVisible ? "visible" : ""}`}>
                {content}
                <div className="tooltip-arrow" />
            </div>
            {children}
        </div>
    );
};

export default Tooltip;
