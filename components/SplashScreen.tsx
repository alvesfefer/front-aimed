import React from 'react';

interface SplashScreenProps {
  fadeOut: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ fadeOut }) => {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#002A32] to-[#004d57] overflow-hidden transition-all duration-700 ease-in-out transform ${
        fadeOut ? 'opacity-0 -translate-y-[15px] pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes heartbeatText {
          0% { transform: scale(1); text-shadow: 0 0 10px rgba(20, 184, 166, 0); opacity: 0.9; }
          10% { transform: scale(1.05); text-shadow: 0 0 25px rgba(20, 184, 166, 0.6); opacity: 1; }
          20% { transform: scale(1); text-shadow: 0 0 10px rgba(20, 184, 166, 0.1); opacity: 0.9; }
          30% { transform: scale(1.02); text-shadow: 0 0 15px rgba(20, 184, 166, 0.3); opacity: 1; }
          40% { transform: scale(1); text-shadow: 0 0 10px rgba(20, 184, 166, 0); opacity: 0.9; }
          100% { transform: scale(1); text-shadow: 0 0 10px rgba(20, 184, 166, 0); opacity: 0.9; }
        }

        @keyframes ecgMove {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes particleRise {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }

        .aimed-text {
          background: linear-gradient(to bottom, #ffffff, #ccfbf1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 2px rgba(20, 184, 166, 0.8));
          animation: heartbeatText 2s ease-in-out infinite;
        }

        .ecg-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecgMove 3s linear infinite;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(20, 184, 166, 0.3);
          box-shadow: 0 0 10px rgba(20, 184, 166, 0.2);
          animation: particleRise 4s infinite linear;
        }
      `}</style>

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Particles Effect (Visible only during transition/exit or subtly always) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 2 + 3}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        
        {/* AIMED Text */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter aim-text aimed-text relative">
          AIMED
          {/* Subtle Green Outline Effect via Stroke/Shadow simulation */}
          <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-transparent to-transparent stroke-2 stroke-teal-400 opacity-20" style={{ WebkitTextStroke: '1px #2dd4bf' }}>AIMED</span>
        </h1>

        {/* ECG Line Container */}
        <div className="w-full max-w-md h-32 relative flex items-center justify-center mt-4">
           <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(45, 212, 191, 0)" />
                  <stop offset="10%" stopColor="rgba(45, 212, 191, 0.2)" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="90%" stopColor="rgba(45, 212, 191, 0.2)" />
                  <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* ECG Path: Flat line -> P -> QRS -> T -> Flat line */}
              <path 
                d="M0 75 L100 75 L110 75 L120 65 L130 85 L140 75 L150 75 L160 75 L170 20 L180 130 L190 75 L210 75 L230 55 L250 75 L500 75"
                fill="none"
                stroke="url(#ecgGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                className="ecg-line"
              />
           </svg>
        </div>

        {/* Status Text */}
        <div className="absolute bottom-[-40px] text-teal-100/60 text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse">
          Inicializando Sistema
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;