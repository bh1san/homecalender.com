
"use client";

import React, { useEffect, useRef, useState } from 'react';

const UpcomingEventsWidget = () => {
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

    const container = containerRef.current;
    
    // The script might have already run and replaced our container.
    // To prevent stacking widgets, we can check for a marker.
    if (container.querySelector('iframe')) {
        return;
    }

    // Clear the container to prevent script duplication on re-renders
    container.innerHTML = '';

    // Set up configuration on the window object
    (window as any).nc_ev_width = '100%'; // Make width responsive
    (window as any).nc_ev_height = 303;
    (window as any).nc_ev_def_lan = 'np';
    (window as any).nc_ev_api_id = 3472025082787;

    // Create the script element to load the widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.ashesh.com.np/calendar-event/ev.js';
    script.async = true;

    // Append script to the container
    container.appendChild(script);

    // The external script is supposed to add its own attribution link.
    
    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isMounted]);

  return <div ref={containerRef} className="w-full h-[303px] overflow-hidden" />;
};

export default UpcomingEventsWidget;

    