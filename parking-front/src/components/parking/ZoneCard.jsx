import React from 'react';

const ZoneCard = ({ 
  zone, 
  isSelected, 
  onSelect, 
  isDisabled, 
  specialRateActive,
  visitorMode 
}) => {
  const isAvailable = visitorMode 
    ? zone.availableForVisitors > 0 && zone.open
    : zone.availableForSubscribers > 0 && zone.open;

  const getStatusColor = () => {
    if (!zone.open) return 'danger';
    if (isAvailable) return 'success';
    return 'warning';
  };

  const getStatusText = () => {
    if (!zone.open) return 'Closed';
    if (visitorMode) {
      return zone.availableForVisitors > 0 ? 'Available' : 'Full';
    }
    return zone.availableForSubscribers > 0 ? 'Available' : 'Full';
  };

  return (
    <div 
      className={`zone-card ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => !isDisabled && onSelect(zone)}
    >
      <div className="zone-card-header">
        <div className="zone-title">
          <h4>{zone.name}</h4>
          {specialRateActive && (
            <div className="special-rate-badge">
              <span className="rate-badge">Special Rate Active</span>
            </div>
          )}
        </div>
        <div className={`zone-status ${getStatusColor()}`}>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      <div className="zone-card-body">
        <div className="zone-info">
          <div className="info-row">
            <span className="info-label">Total Slots:</span>
            <span className="info-value">{zone.totalSlots}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Occupied:</span>
            <span className="info-value occupied">{zone.occupied}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Free:</span>
            <span className="info-value free">{zone.free}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Reserved:</span>
            <span className="info-value reserved">{zone.reserved}</span>
          </div>
        </div>

        <div className="zone-availability">
          <div className="availability-row">
            <div className="availability-item">
              <i className="fas fa-user me-1"></i>
              <span className="availability-label">Visitors:</span>
              <span className={`availability-value ${zone.availableForVisitors > 0 ? 'available' : 'unavailable'}`}>
                {zone.availableForVisitors}
              </span>
            </div>
            <div className="availability-item">
              <i className="fas fa-id-card me-1"></i>
              <span className="availability-label">Subscribers:</span>
              <span className={`availability-value ${zone.availableForSubscribers > 0 ? 'available' : 'unavailable'}`}>
                {zone.availableForSubscribers}
              </span>
            </div>
          </div>
        </div>

        <div className="zone-rates">
          <div className="rate-info">
            <div className="rate-item">
              <span className="rate-label">Normal:</span>
              <span className={`rate-value ${specialRateActive ? 'inactive' : 'active'}`}>
                ${zone.rateNormal}/hr
              </span>
            </div>
            <div className="rate-item">
              <span className="rate-label">Special:</span>
              <span className={`rate-value ${specialRateActive ? 'active' : 'inactive'}`}>
                ${zone.rateSpecial}/hr
              </span>
            </div>
          </div>
          {specialRateActive && (
            <div className="special-rate-indicator">
              <i className="fas fa-bolt me-1"></i>
              <span>Special Rate Active</span>
            </div>
          )}
        </div>

        <div className="zone-category">
          <span className="category-badge">{zone.categoryId}</span>
        </div>
      </div>

      <div className="zone-card-footer">
        {isSelected && (
          <div className="selection-indicator">
            <i className="fas fa-check-circle me-2"></i>
            <span>Selected for check-in</span>
          </div>
        )}
        {isDisabled && (
          <div className="disabled-indicator">
            <i className="fas fa-ban me-2"></i>
            <span>
              {!zone.open ? 'Zone Closed' : 
               visitorMode ? 'No Visitor Slots' : 'No Subscriber Slots'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneCard;