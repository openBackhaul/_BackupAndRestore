import React, { useState, useRef, useEffect } from 'react';

/**
 * Multi-select dropdown with checkboxes
 * @param {string} label - Label for the dropdown
 * @param {Array} options - Array of option values
 * @param {Array} selectedValues - Array of currently selected values
 * @param {Function} onChange - Callback when selection changes
 * @param {string} placeholder - Placeholder text when nothing selected
 * @param {boolean} disabled - Whether dropdown is disabled
 */
export default function MultiSelectDropdown({ 
  label, 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select...",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };



  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    return selectedValues.join(", ");
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      {label && <label className="form-label">{label}</label>}
      <div className="dropdown" style={{ position: 'relative' }}>
        <button
          className="form-select w-100 text-start d-flex justify-content-between align-items-center"
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{ 
            backgroundColor: disabled ? '#e9ecef' : 'white',
            textAlign: 'left',
            color: '#212529', 
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundImage: 'none' 
          }}
        >
          <span className={selectedValues.length === 0 ? 'text-muted' : ''}>
            {getDisplayText()}
          </span>
          <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </button>

        {isOpen && !disabled && (
          <div 
            className="dropdown-menu show w-100" 
            style={{ 
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
              maxHeight: '250px',
              overflowY: 'auto',
              boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)'
            }}
          >


            {/* Select All */}
            {options.length > 1 && (
              <>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    if (selectedValues.length === options.length) {
                      onChange([]);
                    } else {
                      onChange([...options]);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedValues.length === options.length}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedValues.length > 0 && selectedValues.length < options.length;
                      }}
                      onChange={() => {}}
                      style={{ pointerEvents: 'none' }}
                    />
                    <label className="form-check-label fw-semibold" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Select All
                    </label>
                  </div>
                </div>
                <hr className="dropdown-divider my-1" />
              </>
            )}

            {/* Options */}
            {options.length === 0 ? (
              <div className="dropdown-item text-muted">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  className="dropdown-item"
                  onClick={() => handleToggle(option)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => {}} // Handled by parent div onClick
                      style={{ pointerEvents: 'none' }}
                    />
                    <label 
                      className="form-check-label" 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      {option}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>      
    </div>
  );
}
