"use client";

import React, { useEffect, useRef } from 'react';

const UpcomingEventsWidget = () => {
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetContainerRef.current) return;

    // Clear any previous widget content to avoid duplicates on re-renders
    widgetContainerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // Using innerHTML to set the script content
    script.innerHTML = `
      var nc_ev_width = 'responsive';
      var nc_ev_height = 303;
      var nc_ev_def_lan = 'np';
      var nc_ev_api_id = 2102025082274;
    `;
    
    const widgetScript = document.createElement('script');
    widgetScript.type = 'text/javascript';
    widgetScript.src = 'https://www.ashesh.com.np/calendar-event/ev.js';
    widgetScript.async = true;

    const widgetLink = document.createElement('div');
    widgetLink.id = 'ncwidgetlink';
    // The HTML for the link can be set directly
    widgetLink.innerHTML = 'Powered by © <a href="https://www.ashesh.com.np/nepali-calendar/" id="nclink" title="Nepali calendar" target="_blank">Nepali Calendar</a>';

    // Append all parts to the container
    widgetContainerRef.current.appendChild(script);
    widgetContainerRef.current.appendChild(widgetScript);
    widgetContainerRef.current.appendChild(widgetLink);

    // Cleanup function to remove the scripts and link when the component unmounts
    return () => {
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return <div ref={widgetContainerRef} className="w-full h-[303px]"></div>;
};

export default UpcomingEventsWidget;
