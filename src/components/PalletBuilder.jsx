import { useState, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Package, Save, Download, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './PalletBuilder.css';

const Pallet = ({ specs }) => {
  const { length, width, height, deckBoards, stringers, material } = specs;
  const scale = 0.001;

  // Realistic, distinct wood colors for each part
  const colorSets = {
    pine: {
      top: '#e3c08d',
      block: '#b88a5a',
      bottom: '#a97c50',
    },
    oak: {
      top: '#c9a063',
      block: '#a97c50',
      bottom: '#7c5a36',
    },
    birch: {
      top: '#f5e6c8',
      block: '#e2cfa5',
      bottom: '#cbb88a',
    },
    recycled: {
      top: '#b0a99f',
      block: '#8c8377',
      bottom: '#6e665c',
    },
  };
  const colors = colorSets[material] || colorSets.pine;

  const sLength = length * scale;
  const sWidth = width * scale;
  const sHeight = height * scale;

  const topBoardThickness = sHeight * 0.15;
  const bottomBoardThickness = sHeight * 0.15;
  const blockHeight = sHeight - topBoardThickness - bottomBoardThickness;
  
  const numBlockRows = stringers;
  const numBlocksPerRow = 3;
  const blockLength = sLength * 0.12;
  const blockWidth = sWidth * 0.12;

  // For bottom boards, use a much lighter, attractive wood color
  const bottomBoardColor = '#e7cfa2'; // light, warm, attractive

  return (
    <group>
      {/* Top Deck Boards */}
      {Array.from({ length: deckBoards }).map((_, i) => (
        <mesh
          castShadow
          receiveShadow
          key={`top-${i}`}
          position={[0, blockHeight / 2 + topBoardThickness / 2, (i - (deckBoards - 1) / 2) * (sWidth / deckBoards) * 1.05]}
        >
          <boxGeometry args={[sLength, topBoardThickness, sWidth / deckBoards * 0.95]} />
          <meshStandardMaterial color={colors.top} roughness={0.45} metalness={0.12} />
        </mesh>
      ))}
      
      {/* Screws on Top Deck Boards */}
      {Array.from({ length: deckBoards }).flatMap((_, i) =>
        Array.from({ length: numBlockRows }).map((_, j) => {
          const boardZ = (i - (deckBoards - 1) / 2) * (sWidth / deckBoards) * 1.05;
          const rowX = (j - (numBlockRows - 1) / 2) * (sLength - blockLength) / (numBlockRows > 1 ? numBlockRows - 1 : 1);
          const screwY = blockHeight / 2 + topBoardThickness + 0.01;
          return (
            <mesh key={`screw-${i}-${j}`} position={[rowX, screwY, boardZ]} castShadow receiveShadow>
              <cylinderGeometry args={[0.004, 0.004, 0.006, 16]} />
              <meshStandardMaterial color={'#b0b0b0'} metalness={0.85} roughness={0.25} />
            </mesh>
          );
        })
      )}
      {/* Blocks */}
      {Array.from({ length: numBlockRows }).flatMap((_, i) =>
        Array.from({ length: numBlocksPerRow }).map((_, j) => (
          <mesh
            castShadow
            receiveShadow
            key={`block-${i}-${j}`}
            position={[
              (i - (numBlockRows - 1) / 2) * (sLength - blockLength) / (numBlockRows > 1 ? numBlockRows - 1 : 1),
              0,
              (j - (numBlocksPerRow - 1) / 2) * (sWidth - blockWidth) / (numBlocksPerRow > 1 ? numBlocksPerRow - 1 : 1)
            ]}
          >
            <boxGeometry args={[blockLength, blockHeight, blockWidth]} />
            <meshStandardMaterial color={colors.block} roughness={0.5} metalness={0.1} />
          </mesh>
        ))
      )}
      {/* Bottom Boards */}
      {Array.from({ length: numBlockRows }).map((_, i) => (
         <mesh
          castShadow
          receiveShadow
          key={`bottom-${i}`}
          position={[
            (i - (numBlockRows - 1) / 2) * (sLength - blockLength) / (numBlockRows > 1 ? numBlockRows - 1 : 1),
            -blockHeight / 2 - bottomBoardThickness / 2,
            0
          ]}
        >
          <boxGeometry args={[blockLength * 1.2, bottomBoardThickness, sWidth]} />
          <meshStandardMaterial color={bottomBoardColor} roughness={0.7} metalness={0.03} />
        </mesh>
      ))}
    </group>
  );
};

const RotatingPallet = ({ children, isPaused }) => {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.005;
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

const Builder = () => {
  const [specs, setSpecs] = useState({
    length: 1200,
    width: 800,
    height: 150,
    deckBoards: 7,
    stringers: 3, // Note: The visual model is Euro-style (blocks), but this can be kept for price calculation
    material: 'pine',
    loadCapacity: 1000
  });

  const [savedDesigns, setSavedDesigns] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const materials = [
    { value: 'pine', label: 'Pine Wood', price: 1.2 },
    { value: 'oak', label: 'Oak Wood', price: 2.1 },
    { value: 'birch', label: 'Birch Wood', price: 1.8 },
    { value: 'recycled', label: 'Recycled Wood', price: 0.9 }
  ];

  const calculatePrice = () => {
    const materialMultiplier = materials.find(m => m.value === specs.material)?.price || 1;
    const basePrice = (specs.length * specs.width * specs.height) / 1000000 * 50;
    const boardsPrice = specs.deckBoards * 15;
    const stringersPrice = specs.stringers * 25; // Calculation can still use stringers
    return Math.round((basePrice + boardsPrice + stringersPrice) * materialMultiplier);
  };

  const handleSpecChange = (key, value) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  const saveDesign = () => {
    setSavedDesigns(prev => [...prev, { ...specs }]);
    toast.success('Design saved successfully!');
  };

  const resetDesign = () => {
    setSpecs({
      length: 1200,
      width: 800,
      height: 150,
      deckBoards: 7,
      stringers: 3,
      material: 'pine',
      loadCapacity: 1000
    });
    toast.info('Design reset to defaults');
  };

  const exportDesign = () => {
    const designData = {
      ...specs,
      estimatedPrice: calculatePrice(),
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pallet-design-${Date.now()}.json`;
    link.click();
    
    toast.success('Design exported successfully!');
  };

  return (
    <div className="min-vh-100 pb-4 builder-bg" style={{ paddingTop: '100px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5"
        >
          <h1 className="display-4 fw-bold mb-3">
            <span className="text-warning">Pallet</span> Builder
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '600px' }}>
            Design custom pallets with precise specifications and real-time visualization
          </p>
        </motion.div>

        <div className="row g-4">
          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-lg-4"
          >
            <div className="builder-card rounded-3 p-4">
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
                <Ruler className="text-warning" />
                Specifications
              </h2>

              <div className="d-flex flex-column gap-4">
                {/* Dimensions */}
                <div>
                  <h3 className="h6 fw-semibold mb-3 text-warning">Dimensions (mm)</h3>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small">Length</label>
                      <input
                        type="number"
                        value={specs.length}
                        onChange={(e) => handleSpecChange('length', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="600"
                        max="2000"
                        step="50"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Width</label>
                      <input
                        type="number"
                        value={specs.width}
                        onChange={(e) => handleSpecChange('width', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="400"
                        max="1500"
                        step="50"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Height</label>
                      <input
                        type="number"
                        value={specs.height}
                        onChange={(e) => handleSpecChange('height', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="100"
                        max="300"
                        step="10"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Load Capacity (kg)</label>
                      <input
                        type="number"
                        value={specs.loadCapacity}
                        onChange={(e) => handleSpecChange('loadCapacity', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="500"
                        max="3000"
                        step="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Structure */}
                <div>
                  <h3 className="h6 fw-semibold mb-3 text-warning">Structure</h3>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small">Top Deck Boards</label>
                      <input
                        type="number"
                        value={specs.deckBoards}
                        onChange={(e) => handleSpecChange('deckBoards', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="5"
                        max="25"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Support Rows</label>
                      <input
                        type="number"
                        value={specs.stringers}
                        onChange={(e) => handleSpecChange('stringers', parseInt(e.target.value))}
                        className="form-control builder-input"
                        min="2"
                        max="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="form-label small">Material</label>
                  <select
                    value={specs.material}
                    onChange={(e) => handleSpecChange('material', e.target.value)}
                    className="form-select builder-select"
                  >
                    {materials.map(material => (
                      <option key={material.value} value={material.value}>
                        {material.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Display */}
                <div className="price-box rounded p-3">
                  <div className="text-center">
                    <div className="small text-white-50 mb-1">Estimated Price</div>
                    <div className="h3 fw-bold text-warning">
                      ₹{calculatePrice().toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      onClick={saveDesign}
                      className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={exportDesign}
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                  <div className="col-12">
                    <button
                      onClick={resetDesign}
                      className="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Reset Design
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visualization Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="col-lg-8"
          >
            <div className="builder-card rounded-3 p-4 h-100 d-flex flex-column">
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
                <Package className="text-warning" />
                3D Preview
              </h2>

              {/* 3D Visualization Area */}
              <div 
                className="preview-container rounded d-flex align-items-center justify-content-center position-relative overflow-hidden flex-grow-1"
                onPointerDown={() => setIsPaused(true)}
                onPointerUp={() => setIsPaused(false)}
                onPointerLeave={() => setIsPaused(false)}
              >
                 <Suspense fallback={
                   <div className="d-flex flex-column justify-content-center align-items-center h-100">
                     <div className="spinner-border text-warning" role="status">
                       <span className="visually-hidden">Loading...</span>
                     </div>
                     <p className="text-white mt-2">Loading Preview</p>
                   </div>
                 }>
                  <Canvas shadows camera={{ position: [1.8, 1.4, 2.2], fov: 50 }} style={{ background: '#292b2c' }}>
                    <ambientLight intensity={0.38} />
                    <directionalLight
                      castShadow
                      position={[10, 20, 5]}
                      intensity={1.25}
                      color={'#fffbe6'}
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                      shadow-camera-far={50}
                      shadow-camera-left={-10}
                      shadow-camera-right={10}
                      shadow-camera-top={10}
                      shadow-camera-bottom={-10}
                      shadow-bias={-0.0007}
                    />
                    {/* Fill light for realism */}
                    <directionalLight
                      position={[-8, 6, -8]}
                      intensity={0.35}
                      color={'#b0c4de'}
                    />
                    <RotatingPallet isPaused={isPaused}>
                      <Pallet specs={specs} />
                    </RotatingPallet>
                    <OrbitControls makeDefault />
                  </Canvas>
                </Suspense>

                {/* Specs Overlay */}
                <div className="position-absolute top-0 start-0 m-3 bg-dark rounded p-2 small">
                  <div className="text-warning fw-semibold mb-2">Current Design</div>
                  <div className="text-light d-flex flex-column gap-1">
                    <div>{specs.length} × {specs.width} × {specs.height} mm</div>
                    <div>{specs.deckBoards} boards, {specs.stringers} support rows</div>
                    <div className="text-capitalize">{specs.material} wood</div>
                    <div>{specs.loadCapacity} kg capacity</div>
                  </div>
                </div>
              </div>

              {/* Design Summary */}
              <div className="row g-3 mt-3">
                <div className="col-md-6">
                  <div className="builder-card-alt rounded p-3">
                    <h3 className="h6 fw-semibold text-warning mb-2">Material Details</h3>
                    <div className="small text-white-50">
                      <div>Type: {materials.find(m => m.value === specs.material)?.label}</div>
                      <div>Top Boards: {specs.deckBoards} pieces</div>
                      <div>Support: {specs.stringers} block rows</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="builder-card-alt rounded p-3">
                    <h3 className="h6 fw-semibold text-warning mb-2">Performance</h3>
                    <div className="small text-white-50">
                      <div>Load Capacity: {specs.loadCapacity} kg</div>
                      <div>Estimated Weight: {Math.round((specs.length * specs.width * specs.height) / 45000)} kg</div>
                      <div>Durability: High</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Saved Designs */}
        {savedDesigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-5"
          >
            <h2 className="h4 fw-bold mb-4">Saved Designs</h2>
            <div className="row g-4">
              {savedDesigns.map((design, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="builder-card rounded p-3">
                    <h3 className="h6 fw-semibold mb-2">Design #{index + 1}</h3>
                    <div className="small text-white-50 d-flex flex-column gap-1">
                      <div>{design.length} × {design.width} × {design.height} mm</div>
                      <div className="text-capitalize">{design.material} wood</div>
                      <div className="text-warning fw-semibold">
                        ₹{Math.round((design.length * design.width * design.height) / 1000000 * 50 * (materials.find(m => m.value === design.material)?.price || 1)).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setSpecs(design)}
                      className="btn btn-warning text-dark w-100 mt-3 fw-bold"
                    >
                      Load Design
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Builder;