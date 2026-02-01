import React from "react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
}

export default function ProcessingIndicator({
  isProcessing,
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;

  return (
    <div 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 1000,
        borderRadius: 8,
      }} 
      aria-live="polite"
    >
      {/* Animated spinner */}
      <div style={{
        width: 64,
        height: 64,
        border: '6px solid rgba(96, 165, 250, 0.3)',
        borderTop: '6px solid rgb(96, 165, 250)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      
      <div style={{ textAlign: 'center', color: '#f3f4f6' }}>
        <strong style={{ fontSize: 18, display: 'block', marginBottom: 6 }}>
          Analyzing screenshot...
        </strong>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
          Detecting tubes, colors, and segments
        </p>
      </div>
      
      {/* Add keyframe animation via style tag */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
