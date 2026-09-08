import React, { createContext, useState, useEffect, useRef } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Synthesize alarm sound using browser Web Audio API (Document 01: BUS FULL audio alarm)
  const playFullAlarm = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio alarm playback error:', e);
    }
  };

  const connect = () => {
    if (!isComponentMounted.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // When using Vite proxy in local development, direct to ws://localhost:5000 or proxy /ws
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:5000`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isComponentMounted.current) return;
        setIsConnected(true);
        console.log('Connected to BusTrack WebSocket Server');
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Audio alarm check if a bus becomes full
          if (data.type === 'BUS_UPDATE' && data.data) {
            const { currentCount, capacity } = data.data;
            if (capacity > 0 && currentCount / capacity >= 0.9) {
              playFullAlarm();
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        if (!isComponentMounted.current) return;
        setIsConnected(false);
        console.log('WebSocket disconnected, scheduling reconnect...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err.message || 'connection failed');
        ws.close();
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('WebSocket initialization error:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  };

  useEffect(() => {
    isComponentMounted.current = true;
    connect();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        lastMessage,
        isMuted,
        toggleMute,
        playFullAlarm
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
