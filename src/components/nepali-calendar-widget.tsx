
"use client";

import React, { useEffect, useRef, useState } from 'react';

const NepaliCalendarWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run this effect on the client, after the component has mounted
    if (!isMounted || !containerRef.current) {
        return;
    }
    
    // Clear the container to prevent script duplication on re-renders
    const container = containerRef.current;
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
    
    // Append script to the container
    container.appendChild(script);

    // The external script removes the container and replaces it.
    // It also adds its own attribution link, so we don't need to manually add it.

    // Cleanup function to remove the script's side-effects
    return () => {
        // The script might leave global variables or listeners, but a simple
        // innerHTML clear on the container is the most direct cleanup we can do.
        if (container) {
            container.innerHTML = '';
        }
    };
  }, [isMounted]);

  // The container div that will hold the widget. It will be replaced by the script.
  return <div ref={containerRef} className="w-full" />;
};

export default NepaliCalendarWidget;

    