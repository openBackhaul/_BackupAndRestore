import React, { useState, useEffect } from 'react';
import { getServerTimeInfo, getUserTimezone } from '../utils/timeUtils';
import { FaClock, FaGlobe } from 'react-icons/fa';

export default function ServerTimeDisplay({ compact = false }) {
  const [serverTime, setServerTime] = useState(getServerTimeInfo());
  const [userTz, setUserTz] = useState(getUserTimezone());

  useEffect(() => {
    const interval = setInterval(() => {
      setServerTime(getServerTimeInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="server-time-compact" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        color: '#666'
      }}>
        <FaClock style={{ color: '#0067FF' }} />
        <span>
          <strong>Server:</strong> {serverTime.time} UTC
        </span>
        <span style={{ marginLeft: '12px', color: '#999' }}>|</span>
        <FaGlobe style={{ color: '#0067FF' }} />
        <span>
          <strong>Your Time:</strong> {userTz.abbr} ({userTz.offset})
        </span>
      </div>
    );
  }

  return (
    <div className="server-time-display" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.75rem',
      padding: '4px 12px',
      background: '#E6F0FF',
      border: '1px solid #0067FF',
      borderRadius: '4px',
      whiteSpace: 'nowrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <FaClock style={{ color: '#0067FF', fontSize: '0.75rem' }} />
        <span style={{ fontWeight: 600, color: '#0067FF' }}>
          {serverTime.formatted} UTC
        </span>
      </div>
      
      {/* <div style={{ borderLeft: '1px solid #0067FF', height: '20px' }}></div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <FaGlobe style={{ color: '#666', fontSize: '0.7rem' }} />
        <span style={{ color: '#333' }}>
          {userTz.abbr} 
          (UTC{userTz.offset})
        </span>
      </div> */}
    </div>
  );
}
