"use client";

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

const UpcomingEventsWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The external script might not work correctly with Next.js App Router's
    // fast navigation. This effect ensures the script is re-evaluated 
    // and the widget is re-rendered when the component mounts.
    
    // 1. Set up configuration on the window object
    (window as any).nc_ev_width = 250;
    (window as any).nc_ev_height = 303;
    (window as any).nc_ev_def_lan = 'np';
    (window as any).nc_ev_api_id = 3472025082787;

    // 2. Create the script element to load the widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.ashesh.com.np/calendar-event/ev.js';
    script.async = true;

    // 3. Clear the container and append the new script
    // This ensures that if the component re-renders, we don't stack widgets
    if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous content
        containerRef.current.appendChild(script);
    }
    
    // 4. Create the attribution link div
    const linkDiv = document.createElement('div');
    linkDiv.id = 'ncwidgetlink';
    linkDiv.innerHTML = 'Powered by © <a href="https://www.ashesh.com.np/nepali-calendar/" id="nclink" title="Nepali calendar" target="_blank">Nepali Calendar</a>';
    
    if (containerRef.current) {
        // The script might replace the container, so we append the link after a short delay
         setTimeout(() => {
            if(containerRef.current && !document.getElementById('ncwidgetlink')) {
                 containerRef.current.appendChild(linkDiv);
            }
        }, 500);
    }


    // Cleanup function to remove the script when the component unmounts
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default UpcomingEventsWidget;
