"use client";

import React from 'react';

const NepaliCalendarWidget = () => {
  return (
    <div className="w-full h-full">
      <iframe
        src="https://www.nepalicalendar.com/widgets/full"
        frameBorder="0"
        scrolling="no"
        marginWidth={0}
        marginHeight={0}
        style={{ border: 'none', overflow: 'hidden', width: '100%', height: '425px' }}
        allowTransparency={true}
      ></iframe>
    </div>
  );
};

export default NepaliCalendarWidget;
