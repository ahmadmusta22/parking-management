import React, { useState } from 'react';
import TicketPrintAnimation from './TicketPrintAnimation';

const TicketModal = ({ ticket, zone, gate, onClose, onPrint }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!ticket) return null;

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

      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
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
            
            <div className="modal-body">
              <div className="ticket-content">
                {/* Ticket Header */}
                <div className="text-center mb-4">
                  <h3 className="text-primary">PARKING TICKET</h3>
                  <p className="text-muted">Keep this ticket for exit</p>
                </div>

                {/* Ticket Details */}
                <div className="ticket-details">
                  <div className="row g-3">
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
                        <div className="detail-value">{gate?.name || 'N/A'}</div>
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
                <div className="ticket-qr text-center mt-4">
                  <div className="qr-placeholder">
                    <i className="fas fa-qrcode fa-3x text-muted"></i>
                    <div className="qr-text">QR Code</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="ticket-instructions mt-4">
                  <div className="alert alert-info">
                    <h6><i className="fas fa-info-circle me-2"></i>Important Instructions</h6>
                    <ul className="mb-0">
                      <li>Keep this ticket safe - you'll need it to exit</li>
                      <li>Present this ticket at the checkpoint when leaving</li>
                      <li>Do not lose this ticket - replacement fees may apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
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