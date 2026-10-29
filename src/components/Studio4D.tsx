import { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  RotateCw, 
  Orbit, 
  Cpu, 
  Maximize2,
  Minimize2,
  TrendingUp,
  Sliders
} from 'lucide-react';

interface Studio4DProps {
  language: string;
}

export default function Studio4D({ language }: Studio4DProps) {
  // 4D Coordinates / Hyperdimensional direction vectors
  const [dimX, setDimX] = useState<number>(64); // Semantic Depth
  const [dimY, setDimY] = useState<number>(75); // Causal Weight
  const [dimZ, setDimZ] = useState<number>(45); // Mathematical Rigor
  const [dimW, setDimW] = useState<number>(80); // Temporal/Social Impact
  
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [projectionType, setProjectionType] = useState<'tesseract' | 'orthographic'>('tesseract');
  const [hyperVolume, setHyperVolume] = useState<number>(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Rotation angles for 4D space planes
  const angleXY = useRef<number>(0);
  const angleXZ = useRef<number>(0);
  const angleXW = useRef<number>(0);
  const angleYW = useRef<number>(0);
  const angleZW = useRef<number>(0);

  // Compute hyperdimensional metrics
  useEffect(() => {
    // Hyper-volume of the cognitive tensor
    const volume = (dimX / 100) * (dimY / 100) * (dimZ / 100) * (dimW / 100) * 4096;
    setHyperVolume(Math.round(volume));
  }, [dimX, dimY, dimZ, dimW]);

  // Define 16 vertices of a 4D Hypercube (Tesseract)
  const vertices4D = [
    [-1, -1, -1, -1], [1, -1, -1, -1], [1, 1, -1, -1], [-1, 1, -1, -1],
    [-1, -1, 1, -1],  [1, -1, 1, -1],  [1, 1, 1, -1],  [-1, 1, 1, -1],
    [-1, -1, -1, 1],  [1, -1, -1, 1],  [1, 1, -1, 1],  [-1, 1, -1, 1],
    [-1, -1, 1, 1],   [1, -1, 1, 1],   [1, 1, 1, 1],   [-1, 1, 1, 1]
  ];

  // Define edges connecting tesseract vertices
  const edges = [
    // 3D Cube 1 (W = -1)
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 3D Cube 2 (W = 1)
    [8, 9], [9, 10], [10, 11], [11, 8],
    [12, 13], [13, 14], [14, 15], [15, 12],
    [8, 12], [9, 13], [10, 14], [11, 15],
    // Connections between Cube 1 and Cube 2
    [0, 8], [1, 9], [2, 10], [3, 11],
    [4, 12], [5, 13], [6, 14], [7, 15]
  ];

  // Helper to rotate point in 4D planes
  const rotatePoint4D = (point: number[], aXY: number, aXZ: number, aXW: number, aYW: number, aZW: number) => {
    let [x, y, z, w] = point;

    // Rotate XY plane
    let cos = Math.cos(aXY);
    let sin = Math.sin(aXY);
    let tempX = x * cos - y * sin;
    let tempY = x * sin + y * cos;
    x = tempX;
    y = tempY;

    // Rotate XZ plane
    cos = Math.cos(aXZ);
    sin = Math.sin(aXZ);
    tempX = x * cos - z * sin;
    let tempZ = x * sin + z * cos;
    x = tempX;
    z = tempZ;

    // Rotate XW plane
    cos = Math.cos(aXW);
    sin = Math.sin(aXW);
    tempX = x * cos - w * sin;
    let tempW = x * sin + w * cos;
    x = tempX;
    w = tempW;

    // Rotate YW plane
    cos = Math.cos(aYW);
    sin = Math.sin(aYW);
    tempY = y * cos - w * sin;
    tempW = y * sin + w * cos;
    y = tempY;
    w = tempW;

    // Rotate ZW plane
    cos = Math.cos(aZW);
    sin = Math.sin(aZW);
    tempZ = z * cos - w * sin;
    tempW = z * sin + w * cos;
    z = tempZ;
    w = tempW;

    return [x, y, z, w];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas with deep transparent slate
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.min(width, height) * 0.22;
      const centerX = width / 2;
      const centerY = height / 2;

      // Update rotation angles if auto-rotate is on
      if (autoRotate) {
        angleXY.current += 0.008;
        angleXZ.current += 0.005;
        angleXW.current += 0.003 * (dimW / 100);
        angleYW.current += 0.006 * (dimY / 100);
        angleZW.current += 0.004 * (dimZ / 100);
      }

      // Pre-process and project vertices
      const projected2D: [number, number, number][] = [];

      vertices4D.forEach((v) => {
        // Adjust initial vertex coordinates with user dimension sliders
        const scaledV = [
          v[0] * (dimX / 100 + 0.2),
          v[1] * (dimY / 100 + 0.2),
          v[2] * (dimZ / 100 + 0.2),
          v[3] * (dimW / 100 + 0.2)
        ];

        // Apply 4D Rotations
        const rotated = rotatePoint4D(
          scaledV, 
          angleXY.current, 
          angleXZ.current, 
          angleXW.current, 
          angleYW.current, 
          angleZW.current
        );

        // Hyper-perspective projection from 4D to 3D
        // Perspective distance
        const distance4D = 2.4;
        const wFactor = 1 / (distance4D - rotated[3]);
        
        let x3D = rotated[0] * wFactor;
        let y3D = rotated[1] * wFactor;
        let z3D = rotated[2] * wFactor;

        if (projectionType === 'orthographic') {
          x3D = rotated[0];
          y3D = rotated[1];
          z3D = rotated[2];
        }

        // Perspective projection from 3D to 2D
        const distance3D = 2.0;
        const zFactor = 1 / (distance3D - z3D);
        
        const x2D = centerX + x3D * zFactor * scale * 1.6;
        const y2D = centerY + y3D * zFactor * scale * 1.6;

        projected2D.push([x2D, y2D, rotated[3]]); // pass W coordinate to calculate color depths
      });

      // Draw Edges
      edges.forEach(([u, v]) => {
        const [x1, y1, w1] = projected2D[u];
        const [x2, y2, w2] = projected2D[v];

        // Dynamic depth-based lighting color on hyper-axis
        const avgW = (w1 + w2) / 2;
        const opacity = Math.min(Math.max(0.15, (avgW + 1) / 2), 0.9);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        // Inner cube edges vs outer hypercube connections have different color highlights
        const isInnerOuterConnector = (u < 8 && v >= 8);
        if (isInnerOuterConnector) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.75})`; // Purple
          ctx.lineWidth = 1.2;
        } else if (u >= 8) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.8})`; // Blue
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.85})`; // Emerald
          ctx.lineWidth = 1.8;
        }
        ctx.stroke();
      });

      // Draw Vertices
      projected2D.forEach(([x, y, w], idx) => {
        const size = idx >= 8 ? 4.5 : 3.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = idx >= 8 ? '#8b5cf6' : '#10b981';
        ctx.shadowBlur = 8;
        ctx.shadowColor = idx >= 8 ? '#8b5cf6' : '#10b981';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Central gravitational coordinate indicator core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoRotate, projectionType, dimX, dimY, dimZ, dimW]);

  // Labels dictionary
  const labels: Record<string, any> = {
    pt: {
      title: "Studio 4D — Tensores Cognitivos",
      desc: "Rotaciona e orquestra a densidade vetorial de processamento de IA.",
      vol: "Volume de Coerência Ativo",
      density: "Densidade de Vetores",
      proj: "Projeção",
      semantic: "X: Profundidade Semântica",
      causal: "Y: Correlação Causal",
      math: "Z: Rigor Matemático",
      social: "W: Impacto Temporal/Social",
      auto: "Rotação Automática",
      cubeType: "Tipo de Cubo"
    },
    en: {
      title: "Studio 4D — Cognitive Tensors",
      desc: "Rotates and orchestrates the vector density of active AI model logic.",
      vol: "Active Coherence Volume",
      density: "Vector Dimensions",
      proj: "Projection",
      semantic: "X: Semantic Depth",
      causal: "Y: Causal Correlation",
      math: "Z: Mathematical Rigor",
      social: "W: Temporal/Social Impact",
      auto: "Auto Rotate",
      cubeType: "Cube Style"
    },
    es: {
      title: "Studio 4D — Tensores Cognitivos",
      desc: "Rota y orquesta la densidad vectorial del procesamiento de IA.",
      vol: "Volumen de Coherencia Activo",
      density: "Densidad de Vectores",
      proj: "Proyección",
      semantic: "X: Profundidad Semántica",
      causal: "Y: Correlación Causal",
      math: "Z: Rigor Matemático",
      social: "W: Impacto Temporal/Social",
      auto: "Rotación Automática",
      cubeType: "Estilo de Cubo"
    },
    fr: {
      title: "Studio 4D — Tenseurs Cognitifs",
      desc: "Fait tourner et orchestre la densité vectorielle de traitement IA.",
      vol: "Volume de Cohérence Actif",
      density: "Densité des Vecteurs",
      proj: "Projection",
      semantic: "X: Profondeur Sémantique",
      causal: "Y: Corrélation Causale",
      math: "Z: Rigueur Mathématique",
      social: "W: Impact Temporel/Social",
      auto: "Rotation Automatique",
      cubeType: "Style de Cube"
    },
    de: {
      title: "Studio 4D — Kognitive Tensoren",
      desc: "Rotiert und orchestriert die Vektordichte der aktiven KI-Modelllogik.",
      vol: "Aktives Kohärenzvolumen",
      density: "Vektordichte",
      proj: "Projektion",
      semantic: "X: Semantische Tiefe",
      causal: "Y: Kausale Korrelation",
      math: "Z: Mathematische Strenge",
      social: "W: Temporaler/Sozialer Einfluss",
      auto: "Auto-Rotation",
      cubeType: "Würfel-Stil"
    },
    ja: {
      title: "Studio 4D — 認知テンソル空間",
      desc: "AIモデルロジックのアクティブなベクトル密度を回転・操作します。",
      vol: "アクティブコヒーレンス空間容積",
      density: "ベクトル次元密度",
      proj: "投影法",
      semantic: "X: 意味的深度（深さ）",
      causal: "Y: 因果関係の連鎖",
      math: "Z: 数学的厳密性",
      social: "W: 時間的・社会的影響",
      auto: "オートローテーション",
      cubeType: "描画方式"
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div id="studio-4d-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-[520px] relative overflow-hidden">
      
      <div>
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <Orbit size={16} className="text-indigo-400 animate-spin-slow" />
            {t.title}
          </h3>
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded">
            4D Projection (Tesseract)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono leading-normal mb-3">
          {t.desc}
        </p>

        {/* Cognitive Hyperdimensional Canvas Block */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-lg h-[180px] flex items-center justify-center overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={340} 
            height={185} 
            role="img"
            aria-label="Visualização 4D dos tensores cognitivos do sistema"
            tabIndex={0}
            className="w-full h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            onClick={() => setAutoRotate(!autoRotate)}
            title="Clique para alternar rotação"
          >
            Seu navegador não suporta elemento canvas HTML5.
          </canvas>
          
          {/* Real-time calculated tensor statistics */}
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur border border-slate-800/60 p-1.5 rounded text-[9px] font-mono space-y-0.5 pointer-events-none select-none">
            <div className="text-slate-500 font-semibold uppercase">{t.vol}</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
              <TrendingUp size={10} />
              <span>{hyperVolume} points / 4096-dim</span>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => setProjectionType(projectionType === 'tesseract' ? 'orthographic' : 'tesseract')}
              aria-label={`Tipo de projeção: ${projectionType}`}
              className="p-1 rounded bg-slate-900/90 border border-slate-800 text-[9px] font-mono text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              {projectionType.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              aria-pressed={autoRotate}
              aria-label={autoRotate ? 'Desativar rotação automática' : 'Ativar rotação automática'}
              className={`p-1 rounded border text-[9px] font-mono cursor-pointer ${
                autoRotate ? 'bg-indigo-950/40 border-indigo-800 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {autoRotate ? 'ROT ON' : 'ROT OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Hyper-Axis Direction Config sliders */}
      <div className="mt-2.5 space-y-2 border-t border-slate-800/60 pt-3">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1 select-none">
          <Sliders size={12} className="text-slate-500" />
          {t.semantic.split(':')[0]} — {t.vol} Sizing Tensors
        </h4>

        {/* Axis X */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <label htmlFor="studio-dim-x" className="w-32 text-slate-400 text-[10.5px] truncate cursor-pointer">{t.semantic}</label>
          <input 
            id="studio-dim-x"
            name="dimX"
            type="range" 
            min="20" 
            max="120" 
            value={dimX} 
            onChange={(e) => setDimX(Number(e.target.value))} 
            aria-label={t.semantic}
            className="flex-1 accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
          />
          <span className="w-8 text-right text-slate-300 font-semibold">{dimX}%</span>
        </div>

        {/* Axis Y */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <label htmlFor="studio-dim-y" className="w-32 text-slate-400 text-[10.5px] truncate cursor-pointer">{t.causal}</label>
          <input 
            id="studio-dim-y"
            name="dimY"
            type="range" 
            min="20" 
            max="120" 
            value={dimY} 
            onChange={(e) => setDimY(Number(e.target.value))} 
            aria-label={t.causal}
            className="flex-1 accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
          />
          <span className="w-8 text-right text-slate-300 font-semibold">{dimY}%</span>
        </div>

        {/* Axis Z */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <label htmlFor="studio-dim-z" className="w-32 text-slate-400 text-[10.5px] truncate cursor-pointer">{t.math}</label>
          <input 
            id="studio-dim-z"
            name="dimZ"
            type="range" 
            min="20" 
            max="120" 
            value={dimZ} 
            onChange={(e) => setDimZ(Number(e.target.value))} 
            aria-label={t.math}
            className="flex-1 accent-yellow-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
          />
          <span className="w-8 text-right text-slate-300 font-semibold">{dimZ}%</span>
        </div>

        {/* Axis W */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <label htmlFor="studio-dim-w" className="w-32 text-slate-400 text-[10.5px] truncate cursor-pointer">{t.social}</label>
          <input 
            id="studio-dim-w"
            name="dimW"
            type="range" 
            min="20" 
            max="120" 
            value={dimW} 
            onChange={(e) => setDimW(Number(e.target.value))} 
            aria-label={t.social}
            className="flex-1 accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
          />
          <span className="w-8 text-right text-slate-300 font-semibold">{dimW}%</span>
        </div>
      </div>

    </div>
  );
}
