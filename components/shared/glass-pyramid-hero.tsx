"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function GlassPyramidHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const settingsRef = useRef({
    autoRotate: true,
    autoRotateSpeed: 0.3,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // CRITICAL: Check DOM directly for existing canvas to prevent double rendering
    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) {
      // Canvas already exists, don't create another one
      return;
    }

    // Also check ref as secondary guard
    if (rendererRef.current) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // Transparent background
   scene.background = null;
    // Alternative: solid dark blue background (oklch(0.111 0.067 265) ≈ rgb(17, 17, 28))
    // scene.background = new THREE.Color(17 / 255, 17 / 255, 28 / 255);
    // Alternative: black background
    // scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment Map - using lasers.jpeg
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/hdri/prism.jpeg", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.environment = texture;
    });

    // Glass Material - Dark, high-contrast glass prism
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      transmission: 1, // Lower transmission for darker interior
      roughness: 0.05,
      thickness: 0.25, // Much thicker for more light absorption
      ior: 2.5, // Higher IOR for more refraction and contrast
      dispersion: 1, // More chromatic dispersion for rainbow effects
      metalness: 0.25,
      clearcoat: 0.1, // Subtle clearcoat for edge definition
      clearcoatRoughness: 0.0,
      envMapIntensity: 0.3, // Much lower environment reflection
      // Darker tint to simulate smoky/tinted glass
      color: new THREE.Color(0.4, 0.45, 0.55), // Dark blue-gray tint
      // Attenuation simulates light absorption through thick glass
      attenuationColor: new THREE.Color(0.15, 0.18, 0.25), // Very dark blue absorption
      attenuationDistance: 0.5, // Short distance = more absorption
      side: THREE.DoubleSide,
    });

    // Prism Group
    const prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // Prism
    const prismRadius = 1.2 * 3 * 0.67 * 1.1 * 1.5 * 0.9 * 0.75;
    const prismHeight = 1.5 * 1.3 * 3 * 0.67 * 1.5 * 0.9 * 0.75;

    const prismGeometry = new THREE.ConeGeometry(prismRadius, prismHeight, 4, 1);
    prismGeometry.rotateY(Math.PI / 4);
    const prism = new THREE.Mesh(prismGeometry, glassMaterial);
    prismGroup.add(prism);

    prismGroup.rotation.x = Math.PI / 6;
    prismGroup.rotation.y = Math.PI / 4;
    prismGroup.position.y = 0.4; // Move prism up ~60px

    // Lighting - minimal ambient for dramatic contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 300);
    spotLight.position.set(-15, 0, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 80;
    spotLight.penumbra = 0.1;
    spotLight.decay = 0.5;
    spotLight.distance = 50;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Secondary accent light for edge highlights
    const rimLight = new THREE.PointLight(0x4488ff, 50);
    rimLight.position.set(5, 3, -5);
    scene.add(rimLight);

    // Input Beam
    const inputBeamLength = 14;
    const inputBeamAngle = spotLight.angle;
    const inputConeRadius = Math.tan(inputBeamAngle) * inputBeamLength;

    const inputBeamGeometry = new THREE.ConeGeometry(
      inputConeRadius,
      inputBeamLength,
      32,
      1,
      true
    );

    const inputBeamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 0.25 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float fade = 1.0 - vUv.y;
          fade = pow(fade, 1.2);
          float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edge = pow(edge, 0.3);
          float alpha = opacity * fade * edge;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const inputBeam = new THREE.Mesh(inputBeamGeometry, inputBeamMaterial);
    inputBeam.position.set(-15 + inputBeamLength / 2, 0, 0);
    inputBeam.rotation.z = -Math.PI / 2;
    inputBeam.visible = false;
    scene.add(inputBeam);

    // Dust particles
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.015,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const settings = settingsRef.current;

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !prismGroup) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      prismGroup.rotation.y += deltaX * 0.005;
      prismGroup.rotation.x += deltaY * 0.005;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mouseleave", handleMouseLeave);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (settings.autoRotate && !isDraggingRef.current && prismGroup) {
        prismGroup.rotation.y += settings.autoRotateSpeed * 0.01;
      }

      particles.rotation.y += 0.0001;

      renderer.render(scene, camera);
    }
    animate();

    // Mark as initialized
    requestAnimationFrame(() => {
      setIsInitialized(true);
    });

    // Cleanup
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Remove event listeners
      if (renderer) {
        renderer.domElement.removeEventListener("mousedown", handleMouseDown);
        renderer.domElement.removeEventListener("mousemove", handleMouseMove);
        renderer.domElement.removeEventListener("mouseup", handleMouseUp);
        renderer.domElement.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", handleResize);

      // Remove canvas from DOM
      if (container && renderer?.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch (e) {
          // Element may have already been removed
        }
      }

      // Dispose resources
      if (renderer) {
        prismGeometry.dispose();
        glassMaterial.dispose();
        inputBeamGeometry.dispose();
        inputBeamMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
      }

      // Clear refs
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[100vh] relative overflow-visible"
      style={{ visibility: isInitialized ? "visible" : "hidden" }}
    />
  );
}
