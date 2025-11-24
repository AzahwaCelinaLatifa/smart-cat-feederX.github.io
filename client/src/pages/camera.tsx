import React, { useState, useRef, useEffect } from "react";

// CSS untuk force white text pada refresh button
const buttonStyles = `
  .refresh-button {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }
  .refresh-button span {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }
  .refresh-button:hover {
    color: #ffffff !important;
  }
`;

interface CameraStreamProps {
  streamUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const CameraStream: React.FC<CameraStreamProps> = ({
  streamUrl = "http://10.32.10.1:81/stream",
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [status, setStatus] = useState<string>("connecting");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = () => {
    setStatus("connected");
    setLastRefresh(new Date());
  };

  const handleImageError = () => {
    setStatus("error: stream unavailable");
    console.error("Camera stream failed to load");
  };

  const refreshStream = () => {
    if (imgRef.current) {
      const timestamp = Date.now();
      const baseUrl = streamUrl.split('?')[0]; // Remove existing query params
      imgRef.current.src = `${baseUrl}?t=${timestamp}`;
      setStatus("refreshing");
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshStream();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, streamUrl]);

  useEffect(() => {
    // Initial load with timestamp to avoid caching
    const timestamp = Date.now();
    const baseUrl = streamUrl.split('?')[0];
    if (imgRef.current) {
      imgRef.current.src = `${baseUrl}?t=${timestamp}`;
    }
  }, [streamUrl]);

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      {/* Inject CSS untuk force white text */}
      <style dangerouslySetInnerHTML={{ __html: buttonStyles }} />
      
      <img
        ref={imgRef}
        alt="Live Camera Stream"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ 
          width: "100%", 
          maxWidth: "800px", 
          height: "auto",
          background: "#000", 
          borderRadius: "16px",
          border: "3px solid #174143",
          boxShadow: "0 4px 12px rgba(23, 65, 67, 0.2)"
        }}
      />
      
      <div
        style={{
          marginTop: "12px",
          fontFamily: "Montserrat",
          fontSize: "14px",
          color: "#174143",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <span>Status: {status}</span>
        {status === "connected" && (
          <span style={{ fontSize: "12px", color: "#666" }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div style={{ 
        marginTop: "12px", 
        display: "flex", 
        gap: "8px", 
        flexWrap: "wrap" 
      }}>
        <button
          onClick={refreshStream}
          className="px-4 py-2 rounded-xl text-white font-semibold text-xs cursor-pointer border-0 refresh-button"
          style={{
            backgroundColor: "#174143",
            fontFamily: "Montserrat, sans-serif"
          }}
        >
          Refresh Stream
        </button>
        
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = streamUrl;
            link.target = '_blank';
            link.click();
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: "transparent",
            color: "#174143",
            border: "2px solid #174143",
            cursor: "pointer",
            fontFamily: "Montserrat",
            fontWeight: 600,
            fontSize: "12px"
          }}
        >
          Open Direct Stream
        </button>
      </div>
    </div>
  );
};

export default function Camera() {
  const [streamUrl] = useState("http://10.32.10.1:81/stream");
  
  return (
    <div className="space-y-6" style={{marginTop: '-20px', paddingTop: '0'}}>
      <div style={{marginTop: '0', paddingTop: '0'}}>
        <h1 
          className="text-3xl font-bold text-foreground"
          style={{
            color: '#174143',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '0.84px',
            marginTop: '0'
          }}
        >
          Camera Feed
        </h1>
        <p 
          className="text-muted-foreground"
          style={{
            color: '#174143',
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '0.42px',
            marginTop: '10px'
          }}
        >
          Monitor your pet in real-time
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <CameraStream 
          streamUrl={streamUrl}
          autoRefresh={true}
          refreshInterval={30000}
        />
        
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          fontFamily: 'Montserrat',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px' 
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#28a745' 
            }}></div>
            <strong style={{ color: '#174143', fontSize: '14px' }}>
              Camera Stream Info
            </strong>
          </div>
          
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
            <p style={{ margin: '0', color: '#174143' }}>
              <strong>Stream URL:</strong> {streamUrl}
            </p>
            <p style={{ margin: '0', color: '#666' }}>
              <strong>Format:</strong> MJPEG Stream
            </p>
            <p style={{ margin: '0', color: '#666' }}>
              <strong>Auto Refresh:</strong> Every 30 seconds
            </p>
            <p style={{ margin: '0', color: '#666' }}>
              <strong>Direct Access:</strong> Click "Open Direct Stream" for full screen view
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#fff3cd', 
          borderRadius: '8px', 
          border: '1px solid #ffeaa7',
          fontFamily: 'Montserrat', 
          fontSize: '12px' 
        }}>
          <p style={{ margin: '0', color: '#856404', fontWeight: 600 }}>
            <strong>Tip:</strong> If stream doesn't load, make sure ESP32-CAM at 10.32.10.1:81 is powered on and connected to WiFi.
          </p>
        </div>
      </div>
    </div>
  );
}