"use client";

import React from 'react';

const UpcomingEventsWidget = () => {
  return (
    <div className="w-full h-full">
        <iframe
            src="https://www.hamropatro.com/widgets/events-on-this-day-js.php"
            frameBorder="0"
            scrolling="no"
            marginWidth={0}
            marginHeight={0}
            style={{ border: 'none', overflow: 'hidden', width: '100%', height: '303px' }}
            allowTransparency={true}
        ></iframe>
    </div>
  );
};

export default UpcomingEventsWidget;
