import React, { useEffect, useRef, useState } from "react";

interface CatDetectionMeta {
  cats: number;
  detections: { bbox: [number, number, number, number]; conf: number }[];
  infer_ms: number;
  timestamp: number;
}

interface CatStreamProps {
  signalingUrl?: string;
  overlayColor?: string;
  autoplay?: boolean;
}

const CatStream: React.FC<CatStreamProps> = ({
  signalingUrl = "http://localhost:8080/offer",
  overlayColor = "#174143",
  autoplay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [lastMeta, setLastMeta] = useState<CatDetectionMeta | null>(null);

  const drawOverlay = (meta: CatDetectionMeta) => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;
    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;
    if (!w || !h) return;
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.strokeStyle = overlayColor;
    ctx.fillStyle = overlayColor;

    meta.detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const label = `cat ${det.conf.toFixed(2)}`;
      ctx.fillText(label, x1 + 4, y1 - 6 < 12 ? y1 + 16 : y1 - 6);
    });

    ctx.fillText(`cats: ${meta.cats} | infer: ${meta.infer_ms.toFixed(1)}ms`, 10, 20);
  };

  const startConnection = async () => {
    if (pcRef.current) return;
    setStatus("starting");

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      setStatus(pc.connectionState);
      if (pc.connectionState === "failed") {
        console.error("Peer connection failed");
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.ondatachannel = (event) => {
      if (event.channel.label === "cat_meta") {
        event.channel.onmessage = (msg) => {
          try {
            const meta: CatDetectionMeta = JSON.parse(msg.data);
            setLastMeta(meta);
            drawOverlay(meta);
          } catch (e) {
            console.error("Meta parse error", e);
          }
        };
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      const resp = await fetch(signalingUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
      });

      if (!resp.ok) {
        setStatus("error: server responded " + resp.status);
        console.error("Offer request failed", await resp.text());
        return;
      }

      const answer = await resp.json();
      await pc.setRemoteDescription(answer);
      setStatus("connected");
    } catch (err: any) {
      setStatus("error: " + (err.message || "Cannot connect to Python server"));
      console.error("Connection error:", err);
      return;
    }

  };

  useEffect(() => {
    if (autoplay) {
      startConnection().catch((e) => {
        console.error(e);
        setStatus("error");
      });
    }
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onResize = () => {
      if (lastMeta) drawOverlay(lastMeta);
    };
    videoEl.addEventListener("loadedmetadata", onResize);
    return () => videoEl.removeEventListener("loadedmetadata", onResize);
  }, [lastMeta]);

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "640px", background: "#000", borderRadius: "16px" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          width: "100%",
          maxWidth: "640px",
          height: "auto",
        }}
      />
      <div
        style={{
          marginTop: "12px",
          fontFamily: "Montserrat",
          fontSize: "14px",
          color: "#174143",
          fontWeight: 600
        }}
      >
        Status: {status}{" "}
        {lastMeta && `(cats: ${lastMeta.cats} | inference: ${lastMeta.infer_ms.toFixed(1)}ms)`}
      </div>
      {!autoplay && (
        <button
          onClick={() => startConnection()}
          disabled={!!pcRef.current}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            borderRadius: "12px",
            background: "#174143",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontFamily: "Montserrat",
            fontWeight: 600
          }}
        >
          Start Stream
        </button>
      )}
    </div>
  );
};

export default function Camera() {
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
          Monitor your pet in real-time with AI detection
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <CatStream 
          signalingUrl="http://10.32.10.231:8080/offer"
          overlayColor="#174143"
          autoplay={true}
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'Montserrat', fontSize: '12px' }}>
          <p style={{ margin: '4px 0', color: '#174143' }}>
            📡 <strong>Python Server Status:</strong> Connected to 10.32.10.231:8080
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Make sure Python WebRTC server is running on that IP with: <code>python webrtc_server.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
