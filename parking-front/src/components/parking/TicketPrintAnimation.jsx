import React, { useState, useEffect } from 'react';

const TicketPrintAnimation = ({ isPrinting, onPrintComplete, onSkipAnimation }) => {
  const [printPhase, setPrintPhase] = useState('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPrinting) {
      setPrintPhase('printing');
      setProgress(0);
      
      let intervalId;
      let timeoutId;
      
      // Simple, reliable progress animation
      const animateProgress = () => {
        let currentProgress = 0;
        
        intervalId = setInterval(() => {
          currentProgress += 20; // 20% increments
          
          if (currentProgress >= 100) {
            currentProgress = 100;
            setProgress(100);
            clearInterval(intervalId);
            
            // Complete the animation
            setPrintPhase('complete');
            
            // Trigger print after showing completion
            timeoutId = setTimeout(() => {
              setPrintPhase('idle');
              if (onPrintComplete) {
                onPrintComplete();
              }
            }, 1500);
          } else {
            setProgress(currentProgress);
          }
        }, 300); // 300ms intervals
      };
      
      // Start the animation
      animateProgress();
      
      return () => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else {
      setPrintPhase('idle');
      setProgress(0);
    }
  }, [isPrinting, onPrintComplete]);

  if (printPhase === 'idle') return null;

  return (
    <div className="ticket-print-overlay">
      <div className="ticket-print-container">
        {/* Printer Visual */}
        <div className="printer-visual">
          <div className="printer-body">
            <div className="printer-top"></div>
            <div className="printer-base"></div>
            <div className="printer-tray"></div>
          </div>
          
          {/* Paper Animation */}
          {printPhase === 'printing' && (
            <div className="paper-animation">
              <div className="paper-sheet"></div>
            </div>
          )}
          
          {/* Printed Ticket */}
          {printPhase === 'complete' && (
            <div className="printed-ticket">
              <div className="ticket-paper">
                <div className="ticket-content">
                  <div className="ticket-header">PARKING TICKET</div>
                  <div className="ticket-details">
                    <div className="ticket-line">Ticket ID: T-001</div>
                    <div className="ticket-line">Type: Visitor</div>
                    <div className="ticket-line">Time: 12:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Status Text */}
        <div className="print-status">
          {printPhase === 'printing' && (
            <div className="status-printing">
              <i className="fas fa-print fa-2x mb-2"></i>
              <h4>Printing Ticket...</h4>
              <p>Please wait while your ticket is being printed</p>
              {onSkipAnimation && (
                <button 
                  className="btn btn-warning btn-sm mt-3"
                  onClick={onSkipAnimation}
                >
                  <i className="fas fa-forward me-1"></i>
                  Skip Animation
                </button>
              )}
            </div>
          )}
          
          {printPhase === 'complete' && (
            <div className="status-complete">
              <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
              <h4 className="text-success">Print Complete!</h4>
              <p>Your ticket has been printed successfully</p>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {printPhase === 'printing' && (
          <div className="print-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPrintAnimation;