import React, { useEffect, useState } from 'react';
import './AnimatedModal.css';

interface AnimatedModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({ isOpen, onDismiss, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen) setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`modal-overlay ${isAnimating ? 'open' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      onClick={onDismiss}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedModal;
