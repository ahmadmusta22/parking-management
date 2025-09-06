import React, { useState, useEffect } from 'react';

const GateAnimation = ({ isOpen, onAnimationComplete }) => {
  const [animationPhase, setAnimationPhase] = useState('closed');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Start opening animation
      setAnimationPhase('opening');
      
      // Simulate gate opening
      setTimeout(() => {
        setAnimationPhase('open');
        setShowSuccess(true);
        
        // Show success message briefly
        setTimeout(() => {
          setShowSuccess(false);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 2000);
      }, 1500);
    } else {
      setAnimationPhase('closed');
      setShowSuccess(false);
    }
  }, [isOpen, onAnimationComplete]);

  return (
    <div className="gate-animation-overlay">
      <div className="gate-animation-container">
        {/* Gate Visual */}
        <div className={`gate-visual ${animationPhase}`}>
          <div className="gate-left"></div>
          <div className="gate-right"></div>
        </div>
        
        {/* Status Text */}
        <div className="gate-status-text">
          {animationPhase === 'opening' && (
            <div className="status-opening">
              <i className="fas fa-door-open fa-2x mb-2"></i>
              <h4>Gate Opening...</h4>
              <p>Please wait while the gate opens</p>
            </div>
          )}
          
          {animationPhase === 'open' && showSuccess && (
            <div className="status-success">
              <i className="fas fa-check-circle fa-3x mb-3"></i>
              <h4>Gate Open!</h4>
              <p>You may now proceed</p>
            </div>
          )}
          
          {animationPhase === 'closed' && (
            <div className="status-closed">
              <i className="fas fa-door-closed fa-2x mb-2"></i>
              <h4>Gate Closed</h4>
              <p>Ready for next check-in</p>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {animationPhase === 'opening' && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GateAnimation;