import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Settings, Download, Eye, Maximize } from 'lucide-react';
import toast from 'react-hot-toast';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const Simulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState(null);
  const [settings, setSettings] = useState({
    palletType: 'euro',
    loadType: 'boxes',
    loadWeight: 1000,
    environment: 'warehouse',
    duration: 30,
    forkliftType: 'standard'
  });
  const [isPalletPaused, setIsPalletPaused] = useState(false);

  // Add refs for the two range sliders
  const loadWeightRef = useRef(null);
  const durationRef = useRef(null);

  // Helper to set the --range-progress CSS variable for a range input
  const setRangeFill = (input, value, min, max) => {
    if (!input) return;
    const percent = ((value - min) * 100) / (max - min);
    input.style.setProperty('--range-progress', percent + '%');
  };

  // Update fill on mount and when values change
  useEffect(() => {
    setRangeFill(loadWeightRef.current, settings.loadWeight, 100, 3000);
    setRangeFill(durationRef.current, settings.duration, 10, 120);
  }, [settings.loadWeight, settings.duration]);

  const palletTypes = [
    { value: 'euro', label: 'Euro Pallet (1200×800mm)' },
    { value: 'standard', label: 'Standard Pallet (1200×1000mm)' },
    { value: 'custom', label: 'Custom Pallet' },
    { value: 'heavy-duty', label: 'Heavy Duty Pallet' }
  ];

  const loadTypes = [
    { value: 'boxes', label: 'Cardboard Boxes' },
    { value: 'bags', label: 'Bags/Sacks' },
    { value: 'drums', label: 'Drums/Barrels' },
    { value: 'machinery', label: 'Machinery Parts' },
    { value: 'mixed', label: 'Mixed Load' }
  ];

  const environments = [
    { value: 'warehouse', label: 'Indoor Warehouse' },
    { value: 'outdoor', label: 'Outdoor Storage' },
    { value: 'cold', label: 'Cold Storage' },
    { value: 'humid', label: 'Humid Environment' },
    { value: 'transport', label: 'Transportation' }
  ];

  const forkliftTypes = [
    { value: 'standard', label: 'Standard Forklift' },
    { value: 'reach', label: 'Reach Truck' },
    { value: 'pallet-jack', label: 'Pallet Jack' },
    { value: 'order-picker', label: 'Order Picker' }
  ];

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationResults(null);

    // Simulate progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          generateResults();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    toast.success('Simulation started!');
  };

  const generateResults = () => {
    const results = {
      structuralIntegrity: Math.random() * 20 + 80, // 80-100%
      loadDistribution: Math.random() * 15 + 85, // 85-100%
      durabilityScore: Math.random() * 25 + 75, // 75-100%
      safetyRating: Math.random() * 10 + 90, // 90-100%
      estimatedLifespan: Math.floor(Math.random() * 500 + 1000), // 1000-1500 cycles
      recommendations: [
        'Pallet performs well under specified load conditions',
        'Consider reinforcement for loads exceeding 1200kg',
        'Regular inspection recommended every 100 cycles',
        'Suitable for automated handling systems',
        'Avoid exposure to excessive moisture to prolong lifespan',
        'Ensure even load distribution to prevent warping',
        'Replace damaged boards immediately to maintain safety'
      ],
      stressPoints: [
        { location: 'Corner joints', stress: 'Medium', recommendation: 'Monitor for wear' },
        { location: 'Center stringer', stress: 'Low', recommendation: 'Good condition' },
        { location: 'Deck boards', stress: 'Low', recommendation: 'Excellent' }
      ]
    };
    setSimulationResults(results);
    toast.success('Simulation completed!');
  };

  const resetSimulation = () => {
    setSimulationProgress(0);
    setSimulationResults(null);
    setIsSimulating(false);
    toast.success('Simulation reset');
  };

  const exportResults = () => {
    if (!simulationResults) return;
    
    const data = {
      settings,
      results: simulationResults,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation-results-${Date.now()}.json`;
    link.click();
    
    toast.success('Results exported successfully!');
  };

  // Add a RotatingPallet component to wrap the pallet meshes
  function RotatingPallet({ children, paused }) {
    const group = useRef();
    useFrame(() => {
      if (group.current && !paused) {
        group.current.rotation.y += 0.004;
      }
    });
    return <group ref={group}>{children}</group>;
  }

  return (
    <div className="simulator-page min-vh-100 pt-5 pb-4 bg-dark">
      <div className="container py-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <h1 className="display-4 mb-2">
            <span className="text-warning">3D</span> Simulator
          </h1>
          <p className="lead text-light mx-auto" style={{ maxWidth: 700 }}>
            Advanced pallet performance simulation with real-time stress analysis and load testing
          </p>
        </motion.div>

        <div className="row g-4">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-lg-4"
          >
            <div className="card bg-secondary text-white border-0 shadow-sm h-100">
              <div className="card-body">
                <h2 className="h4 mb-4 d-flex align-items-center gap-2">
                  <Settings className="text-warning" />
                  Simulation Settings
                </h2>

                {/* Pallet Type */}
                <div className="mb-3">
                  <label className="form-label">Pallet Type</label>
                  <select
                    value={settings.palletType}
                    onChange={(e) => setSettings(prev => ({ ...prev, palletType: e.target.value }))}
                    className="form-select bg-dark text-white border-0"
                  >
                    {palletTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Load Type */}
                <div className="mb-3">
                  <label className="form-label">Load Type</label>
                  <select
                    value={settings.loadType}
                    onChange={(e) => setSettings(prev => ({ ...prev, loadType: e.target.value }))}
                    className="form-select bg-dark text-white border-0"
                  >
                    {loadTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Load Weight */}
                <div className="mb-3">
                  <label className="form-label">
                    Load Weight: {settings.loadWeight} kg
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    value={settings.loadWeight}
                    onChange={(e) => setSettings(prev => ({ ...prev, loadWeight: parseInt(e.target.value) }))}
                    className="form-range"
                    ref={loadWeightRef}
                  />
                  <div className="d-flex justify-content-between text-secondary small mt-1">
                    <span>100kg</span>
                    <span>3000kg</span>
                  </div>
                </div>

                {/* Environment */}
                <div className="mb-3">
                  <label className="form-label">Environment</label>
                  <select
                    value={settings.environment}
                    onChange={(e) => setSettings(prev => ({ ...prev, environment: e.target.value }))}
                    className="form-select bg-dark text-white border-0"
                  >
                    {environments.map(env => (
                      <option key={env.value} value={env.value}>
                        {env.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulation Duration */}
                <div className="mb-3">
                  <label className="form-label">
                    Duration: {settings.duration} seconds
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="form-range"
                    ref={durationRef}
                  />
                  <div className="d-flex justify-content-between text-secondary small mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>

                {/* Forklift Type */}
                <div className="mb-3">
                  <label className="form-label">Handling Equipment</label>
                  <select
                    value={settings.forkliftType}
                    onChange={(e) => setSettings(prev => ({ ...prev, forkliftType: e.target.value }))}
                    className="form-select bg-dark text-white border-0"
                  >
                    {forkliftTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Control Buttons */}
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      onClick={startSimulation}
                      disabled={isSimulating}
                      className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <Play size={16} />
                      {isSimulating ? 'Running...' : 'Start'}
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={resetSimulation}
                      className="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simulation Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="col-lg-8"
          >
            <div className="card bg-secondary text-white border-0 shadow-sm h-100">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="h4 mb-0 d-flex align-items-center gap-2">
                  <Eye className="text-warning" />
                  3D Visualization
                </h2>
                <button className="btn btn-dark p-2 d-flex align-items-center justify-content-center">
                  <Maximize size={16} />
                </button>
              </div>

              {/* 3D Viewer */}
              <div
                className="bg-dark rounded mb-4 d-flex align-items-center justify-content-center position-relative overflow-hidden"
                style={{ height: '32rem', border: '1px solid #444' }}
                onMouseDown={() => setIsPalletPaused(true)}
                onMouseUp={() => setIsPalletPaused(false)}
                onMouseLeave={() => setIsPalletPaused(false)}
              >
                {/* Simulation Info Overlay */}
                <div className="position-absolute top-0 start-0 m-3 bg-dark bg-opacity-75 rounded p-3 text-white small" style={{ zIndex: 2 }}>
                  <div className="text-warning fw-semibold mb-2">Current Simulation</div>
                  <div className="mb-1">Type: {palletTypes.find(p => p.value === settings.palletType)?.label}</div>
                  <div className="mb-1">Load: {settings.loadWeight}kg {settings.loadType}</div>
                  <div>Environment: {environments.find(e => e.value === settings.environment)?.label}</div>
                </div>
                <Canvas style={{ width: '100%', height: '100%' }} shadows>
                  <PerspectiveCamera makeDefault position={[3, 2, 6]} fov={50} />
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                  <directionalLight position={[-5, -10, -7]} intensity={0.7} />
                  <RotatingPallet paused={isPalletPaused}>
                    {/* Top deck boards (5) - lightest wood */}
                    {[...Array(5)].map((_, i) => (
                      <mesh key={i} position={[-0.8 + i * 0.4, 0.12, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.32, 0.04, 1.2]} />
                        <meshStandardMaterial color="#f5e1b8" />
                      </mesh>
                    ))}
                    {/* Screws on top deck boards (3 per board) */}
                    {[...Array(5)].map((_, i) => (
                      [
                        [-0.5, 0.15],
                        [0, 0.15],
                        [0.5, 0.15],
                      ].map(([z, y], j) => (
                        <mesh key={`screw-${i}-${j}`} position={[-0.8 + i * 0.4, y, z]}>
                          <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
                          <meshStandardMaterial color="#b0b4b8" metalness={0.8} roughness={0.2} />
                        </mesh>
                      ))
                    ))}
                    {/* Stringers (blocks under deck boards) - 9 blocks - medium wood */}
                    {[...Array(9)].map((_, i) => (
                      <mesh key={i} position={[-0.8 + (i % 3) * 0.8, 0, -0.5 + Math.floor(i / 3) * 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[0.16, 0.16, 0.16]} />
                        <meshStandardMaterial color="#deb887" />
                      </mesh>
                    ))}
                    {/* Bottom boards (3) - darkest wood */}
                    {[...Array(3)].map((_, i) => (
                      <mesh key={i} position={[0, -0.12, -0.5 + i * 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[1.6, 0.04, 0.12]} />
                        <meshStandardMaterial color="#bfa06a" />
                      </mesh>
                    ))}
                  </RotatingPallet>
                  <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
                </Canvas>
                {/* Progress Bar */}
                {isSimulating && (
                  <div className="position-absolute bottom-0 start-0 end-0 m-3">
                    <div className="progress" style={{ height: 8 }}>
                      <div 
                        className="progress-bar bg-warning"
                        style={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                    <div className="text-center text-white small mt-2">
                      Progress: {simulationProgress}%
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Metrics */}
              {isSimulating && (
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="bg-dark rounded p-3 text-center">
                      <div className="small text-secondary">Stress Level</div>
                      <div className="h5 fw-bold mb-0" style={{ color: '#FFD600' }}>
                        {Math.floor(Math.random() * 30 + 20)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-dark rounded p-3 text-center">
                      <div className="small text-secondary">Deflection</div>
                      <div className="h5 fw-bold mb-0" style={{ color: '#2563eb' }}>
                        {(Math.random() * 2 + 1).toFixed(1)}mm
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-dark rounded p-3 text-center">
                      <div className="small text-secondary">Load Factor</div>
                      <div className="h5 fw-bold mb-0" style={{ color: '#fff' }}>
                        {(Math.random() * 0.3 + 0.7).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-dark rounded p-3 text-center">
                      <div className="small text-secondary">Safety</div>
                      <div className="h5 fw-bold mb-0" style={{ color: '#1ed760' }}>
                        {Math.floor(Math.random() * 10 + 90)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Results Panel */}
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-5"
          >
            <div className="card bg-secondary text-white border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="h4 mb-0">Simulation Results</h2>
                <button
                  onClick={exportResults}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <Download size={16} />
                  Export Results
                </button>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="bg-dark rounded p-3 text-center">
                    <div className="small text-secondary mb-2">Structural Integrity</div>
                    <div className="h4 fw-bold mb-0" style={{ color: '#1ed760' }}>
                      {simulationResults.structuralIntegrity.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-dark rounded p-3 text-center">
                    <div className="small text-secondary mb-2">Load Distribution</div>
                    <div className="h4 fw-bold mb-0" style={{ color: '#2563eb' }}>
                      {simulationResults.loadDistribution.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-dark rounded p-3 text-center">
                    <div className="small text-secondary mb-2">Durability Score</div>
                    <div className="h4 fw-bold mb-0" style={{ color: '#FFD600' }}>
                      {simulationResults.durabilityScore.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-dark rounded p-3 text-center">
                    <div className="small text-secondary mb-2">Safety Rating</div>
                    <div className="h4 fw-bold mb-0" style={{ color: '#1ed760' }}>
                      {simulationResults.safetyRating.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-2 mb-4">
                {/* Recommendations */}
                <div className="col-md-6 d-flex flex-column align-items-center">
                  <h3 className="h5 text-warning mb-3 text-center">Recommendations</h3>
                  <ul className="list-unstyled mb-0" style={{ textAlign: 'left', display: 'inline-block' }}>
                    {simulationResults.recommendations.map((rec, index) => (
                      <li key={index} className="d-flex align-items-start gap-2 text-light mb-3" style={{ marginBottom: '1.1rem' }}>
                        <div className="rounded-circle bg-warning flex-shrink-0" style={{ width: 8, height: 8, marginTop: 8 }} />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stress Analysis */}
                <div className="col-md-6">
                  <h3 className="h5 text-warning mb-3">Stress Analysis</h3>
                  <div className="mb-3">
                    {simulationResults.stressPoints.map((point, index) => (
                      <div key={index} className="d-flex justify-content-center mb-3">
                        <div className="bg-secondary rounded p-3 w-100" style={{ maxWidth: 500 }}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold text-white">{point.location}</span>
                            <span className={`badge px-3 py-2 fs-6 align-middle ${
                              point.stress === 'Low' ? 'bg-success' :
                              point.stress === 'Medium' ? 'bg-warning text-dark' :
                              'bg-danger'
                            }`} style={{ minWidth: 70, textAlign: 'center' }}>
                              {point.stress}
                            </span>
                          </div>
                          <div className="text-secondary mt-1" style={{ textAlign: 'left' }}>{point.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-dark rounded p-4 text-center">
                <div className="small text-secondary mb-1">Estimated Lifespan</div>
                <div className="h4 fw-bold text-warning mb-0">
                  {simulationResults.estimatedLifespan.toLocaleString()} cycles
                </div>
                <div className="text-secondary small mt-1">
                  Based on current load and usage conditions
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Simulator;