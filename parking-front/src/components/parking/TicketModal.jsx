import React, { useState } from 'react';
import TicketPrintAnimation from './TicketPrintAnimation';

const TicketModal = ({ ticket, zones, gate, onClose, onPrint }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!ticket) return null;

  // Find the zone information from the ticket's zoneId
  const zone = zones?.find(z => z.id === ticket.zoneId);
  
  // Find the gate information from the ticket's gateId
  const ticketGate = gate?.id === ticket.gateId ? gate : null;

  // Debug logging
  console.log('TicketModal Debug:', {
    ticket,
    zones,
    zone,
    gate,
    ticketGate,
    ticketZoneId: ticket.zoneId,
    ticketGateId: ticket.gateId
  });

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
          margin: '4rem auto',
          maxHeight: 'calc(100vh - 8rem)',
          display: 'flex',
          flexDirection: 'column',
          width: '80%',
          maxWidth: '350px'
        }}>
          <div className="modal-content" style={{
            maxHeight: 'calc(100vh - 8rem)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-ticket-alt me-2"></i>
                Parking Ticket
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body" style={{
              overflow: 'auto',
              flex: 1,
              padding: '0.25rem',
              maxHeight: 'calc(100vh - 12rem)'
            }}>
              <div className="ticket-content">
                {/* Ticket Header */}
                <div className="text-center mb-2">
                  <h5 className="text-primary mb-1">PARKING TICKET</h5>
                  <p className="text-muted small">Keep this ticket for exit</p>
                </div>

                {/* Ticket Details */}
                <div className="ticket-details">
                  <div className="row g-2">
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
                  <div className="qr-placeholder" style={{ padding: '0.25rem' }}>
                    <i className="fas fa-qrcode text-muted"></i>
                    <div className="qr-text small">QR Code</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="ticket-instructions mt-1">
                  <div className="alert alert-info small">
                    <h6 className="small mb-1"><i className="fas fa-info-circle me-1"></i>Important Instructions</h6>
                    <ul className="mb-0 small">
                      <li>Keep this ticket safe - you'll need it to exit</li>
                      <li>Present this ticket at the checkpoint when leaving</li>
                      <li>Do not lose this ticket - replacement fees may apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              flexShrink: 0,
              borderTop: '1px solid #dee2e6',
              padding: '0.5rem'
            }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                <i className="fas fa-times me-2"></i>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handlePrint}
              >
                <i className="fas fa-print me-2"></i>
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketModal;