


import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, Globe, Cpu, Activity, Crosshair, AlertOctagon, Play, RotateCcw } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  z: number;
  isAgent: boolean;
  id: number;
  status: 'idle' | 'target' | 'shielded' | 'hit';
  shieldLife: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetId: number;
  color: string;
  trail: {x:number, y:number}[];
  dead: boolean;
}

export const DefenseMode: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({
    threats: 0,
    blocked: 0,
    fps: 60,
    integrity: 100
  });
  const [isAttacking, setIsAttacking] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.002);
  
  // Refs for animation loop to avoid closure staleness
  const stateRef = useRef({
    nodes: [] as Node[],
    particles: [] as Particle[],
    rotation: 0,
    frameCount: 0,
    lastTime: performance.now()
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Nodes (Sphere distribution)
    const initNodes = () => {
      const nodes: Node[] = [];
      const count = 150; 
      const radius = 250;
      
      for (let i = 0; i < count; i++) {
        // Fibonacci Sphere Algorithm
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        nodes.push({
          x: radius * Math.cos(theta) * Math.sin(phi),
          y: radius * Math.sin(theta) * Math.sin(phi),
          z: radius * Math.cos(phi),
          isAgent: Math.random() > 0.7, // 30% are real agents
          id: i,
          status: 'idle',
          shieldLife: 0
        });
      }
      stateRef.current.nodes = nodes;
    };

    initNodes();

    const render = (time: number) => {
      // Handle Resize
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear
      ctx.fillStyle = '#05080f';
      ctx.fillRect(0, 0, width, height);
      
      // Draw Cyberpunk Grid Background
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<width; i+=80) { ctx.moveTo(i,0); ctx.lineTo(i,height); }
      for(let i=0; i<height; i+=80) { ctx.moveTo(0,i); ctx.lineTo(width,i); }
      ctx.stroke();

      // Update Logic
      const state = stateRef.current;
      state.rotation += rotationSpeed;
      state.frameCount++;
      
      // FPS Calculation
      if (time - state.lastTime >= 1000) {
         setStats(prev => ({ ...prev, fps: state.frameCount }));
         state.frameCount = 0;
         state.lastTime = time;
      }

      // Project 3D to 2D
      const scale = 1000; // Field of View
      
      // Sort nodes by Z depth for painter's algorithm
      state.nodes.sort((a, b) => {
          const az = a.z * Math.cos(state.rotation) - a.x * Math.sin(state.rotation);
          const bz = b.z * Math.cos(state.rotation) - b.x * Math.sin(state.rotation);
          return bz - az;
      });

      // Draw Nodes and Connections
      state.nodes.forEach((node) => {
        // Rotate Y axis
        let rx = node.x * Math.cos(state.rotation) - node.z * Math.sin(state.rotation);
        let rz = node.z * Math.cos(state.rotation) + node.x * Math.sin(state.rotation);
        
        // Perspective Transform
        const perspective = scale / (scale - rz);
        const px = cx + rx * perspective;
        const py = cy + node.y * perspective;
        const size = (node.isAgent ? 4 : 2) * perspective;
        const alpha = (rz + 300) / 600; // Fade nodes in back

        if (alpha > 0) {
            // Connections (Nearest Neighbors)
            ctx.beginPath();
            ctx.strokeStyle = node.isAgent ? `rgba(0, 240, 255, ${alpha * 0.15})` : `rgba(100, 100, 100, ${alpha * 0.05})`;
            ctx.lineWidth = node.isAgent ? 1 : 0.5;
            
            // Connect to next 3 nodes in array (simple topology approximation)
            state.nodes.slice(node.id + 1, node.id + 4).forEach(neighbor => {
                let nrx = neighbor.x * Math.cos(state.rotation) - neighbor.z * Math.sin(state.rotation);
                let nrz = neighbor.z * Math.cos(state.rotation) + neighbor.x * Math.sin(state.rotation);
                let n_perspective = scale / (scale - nrz);
                let npx = cx + nrx * n_perspective;
                let npy = cy + neighbor.y * n_perspective;
                ctx.moveTo(px, py);
                ctx.lineTo(npx, npy);
            });
            ctx.stroke();

            // Draw Node Body
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = node.status === 'shielded' 
                ? `rgba(255, 255, 255, ${alpha})` 
                : node.isAgent 
                    ? `rgba(0, 240, 255, ${alpha})` 
                    : `rgba(75, 85, 99, ${alpha})`;
            ctx.fill();
            
            // Draw Active Shield Effect
            if (node.shieldLife > 0) {
                ctx.beginPath();
                ctx.arc(px, py, size * (3 - node.shieldLife/10), 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 240, 255, ${node.shieldLife/20 * alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                node.shieldLife -= 0.5;
                if (node.shieldLife <= 0) node.status = 'idle';
            }
        }
      });

      // Update & Draw Particles (Attacks)
      state.particles.forEach(p => {
          if (p.dead) return;

          // Find Target
          const target = state.nodes[p.targetId];
          
          // Calculate target current 2D position for homing
          let tx = target.x * Math.cos(state.rotation) - target.z * Math.sin(state.rotation);
          let ty = target.y;
          let tz = target.z * Math.cos(state.rotation) + target.x * Math.sin(state.rotation);
          
          // Easing movement
          p.x += (tx - p.x) * 0.08;
          p.y += (ty - p.y) * 0.08;
          p.z += (tz - p.z) * 0.08;

          // Collision Detection
          const dist = Math.sqrt((tx-p.x)**2 + (ty-p.y)**2 + (tz-p.z)**2);
          
          if (dist < 15) {
              p.dead = true;
              if (target.isAgent) {
                  // Agent blocks attack
                  target.status = 'shielded';
                  target.shieldLife = 20;
                  setStats(prev => ({ ...prev, blocked: prev.blocked + 1 }));
              } else {
                  // Decoy hit (no visual effect needed, just absorb)
              }
          }

          // Render Particle
          const perspective = scale / (scale - p.z);
          const px = cx + p.x * perspective;
          const py = cy + p.y * perspective;
          const size = 3 * perspective;
          
          if (perspective > 0) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI*2);
            ctx.fill();
            
            // Trail Effect
            ctx.strokeStyle = p.color;
            ctx.lineWidth = size / 2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            if (p.trail.length > 0) {
               const tail = p.trail[p.trail.length - 1];
               ctx.lineTo(tail.x, tail.y);
            }
            ctx.stroke();
            
            p.trail.unshift({x: px, y: py});
            if(p.trail.length > 4) p.trail.pop();
          }
      });

      // Cleanup dead particles
      state.particles = state.particles.filter(p => !p.dead);

      // Spawner Logic
      if (isAttacking && Math.random() > 0.85) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 800;
          const targetId = Math.floor(Math.random() * state.nodes.length);
          
          state.particles.push({
              x: Math.cos(angle) * dist,
              y: (Math.random() - 0.5) * dist,
              z: Math.sin(angle) * dist,
              vx: 0, vy: 0, vz: 0,
              targetId: targetId,
              color: state.nodes[targetId].isAgent ? '#FF2A6D' : '#FFC107',
              trail: [],
              dead: false
          });
          setStats(prev => ({ ...prev, threats: prev.threats + 1 }));
      }

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isAttacking, rotationSpeed]);

  const triggerMassAttack = () => {
      setIsAttacking(true);
      setRotationSpeed(0.02); // Fast rotation during attack
      setTimeout(() => {
          setIsAttacking(false);
          setRotationSpeed(0.002); // Return to idle
      }, 4000);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="fixed inset-0 z-[100] bg-[#05080f] overflow-hidden"
    >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-start pointer-events-auto">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amunet-accent animate-pulse">
                        <Globe size={20} />
                        <span className="font-mono font-bold tracking-[0.3em] text-lg">AMUNET//GLOBAL_VIEW</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                        LAT: 34.0522° N | LNG: 118.2437° W | LINK: ENCRYPTED
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right hidden sm:block">
                         <div className="text-xs text-gray-500 font-mono">SYSTEM TIME</div>
                         <div className="text-white font-mono">{new Date().toLocaleTimeString()}</div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Central Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                <Crosshair size={64} className="text-amunet-accent" />
            </div>

            {/* Left Panel: Stats */}
            <div className="absolute top-32 left-8 w-64 space-y-4 pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-md border-l-2 border-amunet-danger p-4 text-white font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="text-gray-500 text-[10px] mb-1 tracking-wider">ACTIVE THREATS</div>
                    <div className="text-2xl text-amunet-danger font-bold flex items-center gap-2">
                        {stats.threats} <Activity size={16} className="animate-pulse" />
                    </div>
                </div>
                <div className="bg-black/50 backdrop-blur-md border-l-2 border-amunet-success p-4 text-white font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="text-gray-500 text-[10px] mb-1 tracking-wider">ATTACKS DEFLECTED</div>
                    <div className="text-2xl text-amunet-success font-bold flex items-center gap-2">
                        {stats.blocked} <Shield size={16} />
                    </div>
                </div>
                <div className="bg-black/50 backdrop-blur-md border-l-2 border-amunet-warning p-4 text-white font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="text-gray-500 text-[10px] mb-1 tracking-wider">INTEGRITY</div>
                    <div className="text-2xl text-amunet-warning font-bold">
                        {stats.integrity}%
                    </div>
                    <div className="w-full bg-gray-800 h-1 mt-2">
                        <div className="bg-amunet-warning h-1" style={{width: `${stats.integrity}%`}}></div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Controls */}
            <div className="absolute top-32 right-8 w-64 space-y-4 pointer-events-auto">
                 <div className="bg-black/50 backdrop-blur-md border border-gray-800 p-4 rounded shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                     <h3 className="text-amunet-accent font-bold font-mono text-xs mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                         <Cpu size={14} /> DEFENSE PROTOCOLS
                     </h3>
                     
                     <button 
                        onClick={triggerMassAttack}
                        disabled={isAttacking}
                        className="w-full mb-3 py-3 bg-amunet-danger/10 hover:bg-amunet-danger/20 border border-amunet-danger/50 text-amunet-danger font-bold font-mono text-xs rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,42,109,0.3)]"
                     >
                         <AlertOctagon size={14} />
                         {isAttacking ? 'ENGAGING HOSTILES...' : 'SIMULATE MASS ATTACK'}
                     </button>

                     <button 
                        onClick={() => setRotationSpeed(prev => prev === 0 ? 0.002 : 0)}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs rounded flex items-center justify-center gap-2 transition-all"
                     >
                         {rotationSpeed === 0 ? <Play size={12} /> : <RotateCcw size={12} />}
                         {rotationSpeed === 0 ? 'RESUME ROTATION' : 'FREEZE TOPOLOGY'}
                     </button>
                 </div>

                 <div className="bg-black/50 backdrop-blur-md border border-gray-800 p-4 rounded">
                     <div className="text-[10px] text-gray-500 font-mono mb-2">RENDER STATS</div>
                     <div className="flex justify-between text-xs font-mono text-gray-400">
                         <span>FPS:</span> <span className="text-white">{stats.fps}</span>
                     </div>
                     <div className="flex justify-between text-xs font-mono text-gray-400">
                         <span>NODES:</span> <span className="text-white">150</span>
                     </div>
                 </div>
            </div>
            
            {/* Bottom Status Bar */}
            <div className="border-t border-white/10 pt-4 flex justify-between items-end text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                <div>AMUNET OS v2.5.0 // DEFENSE CORE</div>
                <div className="flex gap-6">
                    <span className="text-amunet-success flex items-center gap-1"><div className="w-1.5 h-1.5 bg-amunet-success rounded-full animate-pulse"></div> ONLINE</span>
                    <span>MTD: ACTIVE</span>
                    <span>DECEPTION: ACTIVE</span>
                </div>
            </div>
        </div>
    </motion.div>
  );
};