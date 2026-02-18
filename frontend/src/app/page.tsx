"use client";

import React, { useEffect, useState } from 'react';
import { Button, App } from 'antd';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SearchBox = dynamic(() => import('@mapbox/search-js-react').then(mod => mod.SearchBox), { ssr: false });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function Home() {
  const { message } = App.useApp();
  const router = useRouter();

  // State for search
  const [destination, setDestination] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/health');
        if (res.ok) {
          console.log('Backend connected');
          message.success('Connected to Backend');
        } else {
          console.error('Backend Connection Failed');
        }
      } catch (error) {
        console.error('Backend Unreachable');
      }
    };

    checkBackend();
  }, [message]);

  const handleExplore = () => {
    if (!destination) {
      message.warning("Please select a destination first!");
      return;
    }
    // Navigate to plan page with destination query param
    router.push(`/plan?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: 0
    }}>
      {/* Dark Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)'
      }}></div>

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'white',
        padding: '24px'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '40px',
            textAlign: 'center',
            textShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        >
          Your Next Adventure Awaits
        </motion.h1>

        {/* Glass Effect Search Bar */}
        <motion.div
          className="glass-effect"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          style={{
            padding: '10px 20px', // Adjusted padding for SearchBox
            borderRadius: '16px',
            display: 'flex',
            gap: '16px',
            width: '100%',
            maxWidth: '600px',
            alignItems: 'center',
            minHeight: '80px' // Ensure height for the search box
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <SearchBox
              accessToken={MAPBOX_TOKEN}
              theme={{
                variables: {
                  fontFamily: 'inherit',
                  unit: '16px',
                  borderRadius: '8px',
                  boxShadow: 'none',
                },
                cssText: `
                    .mapboxgl-ctrl-geocoder, .suggestions-wrapper, .mapboxgl-ctrl {
                        background-color: transparent !important;
                        box-shadow: none !important;
                    }
                    .mapboxgl-ctrl-geocoder--input {
                        color: white !important;
                        font-size: 1.1rem !important;
                        padding-left: 36px !important; /* Space for search icon if we add one inside, or just for aesthetics */
                    }
                    .mapboxgl-ctrl-geocoder--input::placeholder {
                        color: rgba(255, 255, 255, 0.7) !important;
                    }
                    .mapboxgl-ctrl-geocoder--icon-search {
                        display: none !important; /* Hide default icon to use our own or cleaner look */
                    }
                    /* Ensure autocomplete dropdown matches luxury theme */
                    .mapboxgl-ctrl-geocoder .suggestions {
                        background-color: #141414 !important;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        margin-top: 8px;
                    }
                  `
              }}
              options={{
                language: 'en',
                types: 'place,locality,country', // Limit to meaningful destinations
              }}
              placeholder="Where to?"
              value={destination}
              onChange={(val) => {
                setDestination(val);
              }}
              onRetrieve={(res) => {
                const feature = res.features[0];
                if (feature) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const props = feature.properties as any;
                  setDestination(props.name_preferred || props.name || props.place_name || props.full_address || "Selected Location");
                  const [lng, lat] = feature.geometry.coordinates;
                  setCoords({ lat, lng });
                }
              }}
            />
            {/* Custom Search Icon Overlay */}
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Search color="#fff" size={20} />
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleExplore}
            style={{
              background: '#ff4d4f', // Vibrant Red
              borderColor: '#ff4d4f',
              height: '50px',
              width: '120px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Explore
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
