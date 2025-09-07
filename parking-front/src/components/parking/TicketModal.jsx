import React, { useState } from 'react';
import TicketPrintAnimation from './TicketPrintAnimation';
import './TicketModal.css';

const TicketModal = ({ ticket, zones, gate, onClose, onPrint }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!ticket) return null;

  // Find the zone information from the ticket's zoneId
  const zone = zones?.find(z => z.id === ticket.zoneId);
  
  // Find the gate information from the ticket's gateId
  const ticketGate = gate?.id === ticket.gateId ? gate : null;

  // Debug logging for zone/category issue (removed)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePrint = () => {
    setIsPrinting(true);
  };

  const handlePrintComplete = () => {
    setIsPrinting(false);
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <>
      {/* Print Animation */}
      <TicketPrintAnimation
        isPrinting={isPrinting}
        onPrintComplete={handlePrintComplete}
      />

      {/* Printable Ticket Content - Hidden on screen, visible when printing */}
      <div className="ticket-print-content" style={{ display: 'none' }}>
        <div className="ticket-header">
          <h1>PARKING TICKET</h1>
          <p className="ticket-subtitle">Keep this ticket for exit</p>
        </div>
        
        <div className="ticket-details">
          <div className="detail-row">
            <span className="detail-label">Ticket ID:</span>
            <span className="detail-value ticket-id">{ticket.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value">
              <span className="ticket-type">{ticket.type === 'visitor' ? 'Visitor' : 'Subscriber'}</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Check-in Time:</span>
            <span className="detail-value">{formatDate(ticket.checkinAt)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Gate:</span>
            <span className="detail-value">{ticketGate?.name || gate?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Zone:</span>
            <span className="detail-value">{zone?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{zone?.categoryId || 'N/A'}</span>
          </div>
        </div>
        
        <div className="qr-section">
          <div className="qr-placeholder">
            <div>QR</div>
            <div>CODE</div>
          </div>
          <p>Scan at checkpoint</p>
        </div>
        
        <div className="instructions">
          <h3>Important Instructions</h3>
          <ul>
            <li>Keep this ticket safe and dry</li>
            <li>Present at checkpoint for exit</li>
            <li>Replacement fees apply for lost tickets</li>
            <li>Valid for 24 hours from check-in time</li>
          </ul>
        </div>
        
        <div className="footer">
          <p>WeLink CARGO Parking System</p>
          <p>Generated: {formatDate(ticket.checkinAt)}</p>
        </div>
      </div>

      <div className="modal fade show d-block" style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}>
        <div className="modal-dialog" style={{
          margin: '6rem auto',
          maxHeight: 'calc(100vh - 12rem)',
          display: 'flex',
          flexDirection: 'column',
          width: '70%',
          maxWidth: '280px'
        }}>
          <div className="modal-content" style={{
            maxHeight: 'calc(100vh - 12rem)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header" style={{ padding: '0.5rem' }}>
              <h6 className="modal-title mb-0">
                <i className="fas fa-ticket-alt me-1"></i>
                Parking Ticket
              </h6>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body" style={{
              overflow: 'auto',
              flex: 1,
              padding: '0.2rem',
              maxHeight: 'calc(100vh - 16rem)'
            }}>
              <div className="ticket-content">
                {/* Ticket Header */}
                <div className="text-center mb-1">
                  <h6 className="text-primary mb-0 small">PARKING TICKET</h6>
                  <p className="text-muted small mb-1">Keep this ticket for exit</p>
                </div>

                {/* Ticket Details */}
                <div className="ticket-details">
                  <div className="row g-0">
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Ticket ID</label>
                        <div className="detail-value ticket-id">{ticket.id}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Type</label>
                        <div className="detail-value">
                          <span className={`badge ${ticket.type === 'visitor' ? 'bg-info' : 'bg-success'}`}>
                            {ticket.type === 'visitor' ? 'Visitor' : 'Subscriber'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Check-in Time</label>
                        <div className="detail-value">{formatDate(ticket.checkinAt)}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Gate</label>
                        <div className="detail-value">{ticketGate?.name || gate?.name || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Zone</label>
                        <div className="detail-value">{zone?.name || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="detail-item">
                        <label className="detail-label">Category</label>
                        <div className="detail-value">{zone?.categoryId || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="ticket-qr text-center mt-1">
                  <div className="qr-placeholder" style={{ padding: '0.05rem' }}>
                    <i className="fas fa-qrcode text-muted small"></i>
                    <div className="qr-text small">QR Code</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="ticket-instructions mt-1">
                  <div className="alert alert-info small">
                    <h6 className="small mb-1"><i className="fas fa-info-circle me-1"></i>Instructions</h6>
                    <ul className="mb-0 small">
                      <li>Keep ticket safe</li>
                      <li>Present at checkpoint</li>
                      <li>Replacement fees apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              flexShrink: 0,
              borderTop: '1px solid #dee2e6',
              padding: '0.2rem'
            }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={onClose}
              >
                <i className="fas fa-times me-1"></i>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={handlePrint}
              >
                <i className="fas fa-print me-1"></i>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketModal;