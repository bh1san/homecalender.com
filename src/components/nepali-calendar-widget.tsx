
"use client";

import React, { useEffect, useRef } from 'react';

const NepaliCalendarWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    if (isScriptLoaded.current) return;

    const container = containerRef.current;
    if (!container) return;

    // Clear any previous content
    container.innerHTML = '';

    // Set up configuration on the window object
    (window as any).nc_width = '100%'; // Make width responsive
    (window as any).nc_height = 400;     // Adjust height as needed
    (window as any).nc_api_id = 6102025082809;

    // Create the script element to load the widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.ashesh.com.np/calendarlink/nc.js';
    script.async = true;

    // Create the attribution link div
    const linkDiv = document.createElement('div');
    linkDiv.id = 'ncwidgetlink';
    linkDiv.style.textAlign = 'center';
    linkDiv.style.fontSize = '0.8em';
    linkDiv.style.paddingTop = '4px';
    linkDiv.innerHTML = 'Powered by © <a href="https://www.ashesh.com.np/nepali-calendar/" id="nclink" title="Nepali calendar" target="_blank">nepali calendar</a>';

    // Append script and link to the container
    container.appendChild(script);
    
    // The external script might take a moment to load and render, 
    // so we append the attribution link after a short delay.
    const timer = setTimeout(() => {
      if (container && !container.querySelector('#ncwidgetlink')) {
        container.appendChild(linkDiv);
      }
    }, 500);

    isScriptLoaded.current = true;

    // Cleanup function to remove the script and timer when the component unmounts
    return () => {
      clearTimeout(timer);
      if (container) {
        container.innerHTML = '';
      }
      isScriptLoaded.current = false;
    };
  }, []);

  // The container div that will hold the widget
  return <div ref={containerRef} className="w-full" />;
};

export default NepaliCalendarWidget;

    