import React, { useState, useEffect } from 'react';

const TicketPrintAnimation = ({ isPrinting, onPrintComplete, onSkipAnimation }) => {
  const [printPhase, setPrintPhase] = useState('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPrinting) {
      setPrintPhase('printing');
      setProgress(0);
      
      // Fallback timeout to ensure print always completes
      const fallbackTimeout = setTimeout(() => {
        setPrintPhase('complete');
        setTimeout(() => {
          setPrintPhase('idle');
          if (onPrintComplete) {
            onPrintComplete();
          }
        }, 1000);
      }, 5000); // 5 second fallback
      
      // Simulate printing progress with more reliable timing
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 15; // Faster progress
          if (newProgress >= 100) {
            clearInterval(interval);
            clearTimeout(fallbackTimeout);
            setPrintPhase('complete');
            
            // Show completion briefly then trigger print
            setTimeout(() => {
              setPrintPhase('idle');
              if (onPrintComplete) {
                onPrintComplete();
              }
            }, 1000); // Shorter delay
            
            return 100;
          }
          return newProgress;
        });
      }, 200); // Slightly slower interval for smoother animation
      
      return () => {
        clearInterval(interval);
        clearTimeout(fallbackTimeout);
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
            {onSkipAnimation && (
              <button 
                className="btn btn-sm btn-outline-secondary mt-2"
                onClick={onSkipAnimation}
                style={{ fontSize: '0.8rem' }}
              >
                Skip Animation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPrintAnimation;