import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from './ui/text-effect';

export default function SplashScreen({ onComplete }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0a0f1e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '16px',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#111827',
            borderRadius: 16,
            border: '1.5px solid #00f5a0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            boxShadow: '0 0 24px rgba(0,245,160,0.2)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#00f5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6v6"/>
            <path d="M15 6v6"/>
            <path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="15" cy="18" r="2"/>
          </svg>
        </motion.div>

        <TextEffect
          per='char'
          preset='blur'
          delay={0.3}
          className='text-white'
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
          onAnimationComplete={onComplete}
        >
          Welcome to BusTrack System
        </TextEffect>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            color: '#00f5a0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            fontWeight: 400,
            textTransform: 'uppercase',
          }}
        >
          Real-Time Transit Control
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            width: '100%',
            backgroundColor: '#00f5a0',
            transformOrigin: 'left',
            opacity: 0.6,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
