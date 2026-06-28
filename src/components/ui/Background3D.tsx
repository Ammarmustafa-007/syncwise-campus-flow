import React, { useEffect, useState } from 'react';

export function Background3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax calculations
  const parallaxX = mousePosition.x * -30;
  const parallaxY = mousePosition.y * -30;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background">
      <style>
        {`
          @keyframes aurora-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(100px, 50px) scale(1.2); }
          }
          @keyframes aurora-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(-100px, 80px) scale(1.1); }
          }
          @keyframes aurora-3 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(80px, -60px) scale(1.3); }
          }
          @keyframes shard-1 {
            0%, 100% { opacity: 0; transform: translate(-100px, -100px) rotate(45deg); }
            50% { opacity: 1; transform: translate(100px, 100px) rotate(45deg); }
          }
          @keyframes shard-2 {
            0%, 100% { opacity: 0; transform: translate(100px, 100px) rotate(-45deg); }
            50% { opacity: 1; transform: translate(-100px, -100px) rotate(-45deg); }
          }
        `}
      </style>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"
      />

      {/* Abstract Glowing Beams (Vercel/Stripe style) */}
      <div className="absolute inset-0 flex justify-center opacity-30 pointer-events-none">
        <div className="absolute top-0 w-full max-w-4xl h-[600px] bg-gradient-to-b from-primary/30 via-transparent to-transparent blur-[80px] -translate-y-1/2" />
        <div className="absolute bottom-0 w-full max-w-2xl h-[400px] bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent blur-[80px] translate-y-1/2" />
      </div>

      {/* Animated Mesh Gradients (Aurora Effect) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-[2000ms] ease-out"
        style={{ transform: 'translate(' + parallaxX + 'px, ' + parallaxY + 'px)' }}
      >
        {/* Blob 1: Primary (Blueish) */}
        <div 
          className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"
          style={{ animation: 'aurora-1 15s ease-in-out infinite' }}
        />

        {/* Blob 2: Emerald/Teal */}
        <div 
          className="absolute top-[30%] right-[10%] w-[700px] h-[700px] rounded-full bg-emerald-500/15 blur-[120px]"
          style={{ animation: 'aurora-2 20s ease-in-out infinite 2s' }}
        />

        {/* Blob 3: Purple/Indigo */}
        <div 
          className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px]"
          style={{ animation: 'aurora-3 18s ease-in-out infinite 1s' }}
        />
        
        {/* Abstract Floating Shards (Optional micro-details) */}
        <div
          className="absolute top-[20%] right-[30%] w-64 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-[1px]"
          style={{ animation: 'shard-1 8s linear infinite 4s' }}
        />
        <div
          className="absolute bottom-[30%] left-[20%] w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent blur-[1px]"
          style={{ animation: 'shard-2 10s linear infinite 1s' }}
        />
      </div>
    </div>
  );
}
