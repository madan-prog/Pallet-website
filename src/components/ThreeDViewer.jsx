import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeDViewer = ({ specs }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create pallet
    const createPallet = () => {
      // Clear existing pallet if any
      scene.children.forEach(child => {
        if (child.userData.isPallet) {
          scene.remove(child);
        }
      });
      
      // Scale factors to fit in view
      const scale = 0.02;
      const length = specs.length * scale;
      const width = specs.width * scale;
      const height = specs.height * scale;
      
      // Choose material color based on type
      let materialColor;
      switch(specs.material) {
        case 'wood': materialColor = 0x8B4513; break;
        case 'plastic': materialColor = 0x1E90FF; break;
        case 'metal': materialColor = 0xC0C0C0; break;
        default: materialColor = 0x8B4513;
      }
      
      const palletMaterial = new THREE.MeshStandardMaterial({ 
        color: materialColor,
        roughness: specs.material === 'metal' ? 0.3 : 0.8,
        metalness: specs.material === 'metal' ? 0.9 : 0
      });
      
      // Create base
      const baseGeometry = new THREE.BoxGeometry(length, height/3, width);
      const base = new THREE.Mesh(baseGeometry, palletMaterial);
      base.position.y = -height/2 + height/6;
      base.userData.isPallet = true;
      scene.add(base);
      
      // Create deck boards (top)
      const deckBoardHeight = height/6;
      const deckBoardGeometry = new THREE.BoxGeometry(length, deckBoardHeight, width/8);
      
      // Number of deck boards based on size
      const deckBoardCount = Math.max(3, Math.floor(width / 20));
      const spacing = width / (deckBoardCount + 1);
      
      for (let i = 0; i < deckBoardCount; i++) {
        const deckBoard = new THREE.Mesh(deckBoardGeometry, palletMaterial);
        deckBoard.position.y = height/2 - deckBoardHeight/2;
        deckBoard.position.z = -width/2 + spacing * (i + 1);
        deckBoard.userData.isPallet = true;
        scene.add(deckBoard);
      }
      
      // Create runners
      const runnerWidth = width/10;
      const runnerGeometry = new THREE.BoxGeometry(length/8, height*0.6, runnerWidth);
      const runnerCount = specs.deckType === 'double' ? 4 : 3;
      const runnerSpacing = length / (runnerCount + 1);
      
      for (let i = 0; i < runnerCount; i++) {
        const runner = new THREE.Mesh(runnerGeometry, palletMaterial);
        runner.position.x = -length/2 + runnerSpacing * (i + 1);
        runner.position.y = -height/2 + height*0.3;
        runner.userData.isPallet = true;
        scene.add(runner);
      }
      
      // For double deck, add bottom deck boards
      if (specs.deckType === 'double') {
        for (let i = 0; i < deckBoardCount; i++) {
          const deckBoard = new THREE.Mesh(deckBoardGeometry, palletMaterial);
          deckBoard.position.y = -height/2 + deckBoardHeight/2;
          deckBoard.position.z = -width/2 + spacing * (i + 1);
          deckBoard.userData.isPallet = true;
          scene.add(deckBoard);
        }
      }
    };
    
    createPallet();
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    
    // Add to DOM
    mountRef.current.appendChild(renderer.domElement);
    
    // Clean up
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [specs]);
  
  return <div ref={mountRef} />;
};
