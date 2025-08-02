"use client";

import React from 'react';

const NepaliCalendarWidget = () => {
  // Constructing the URL with theme parameters to match the site's aesthetic.
  // The 'red' theme is selected to align with the primary color of the website.
  const widgetUrl = "https://nepalicalendar.rat32.com/embed.php?language=nepali&type=full";

  return (
    <div className="w-full h-full">
      <iframe
        src={widgetUrl}
        frameBorder="0"
        scrolling="no"
        marginWidth={0}
        marginHeight={0}
        style={{ border: 'none', overflow: 'hidden', width: '100%', height: '650px', borderRadius: '5px', padding: '0px', margin: '0px' }}
        allowTransparency={true}
      ></iframe>
    </div>
  );
};

export default NepaliCalendarWidget;
