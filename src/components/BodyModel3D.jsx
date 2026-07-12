import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { getColour } from '../utils/colourUtils'
import { MUSCLE_CONFIG } from '../data/muscleConfig'
import rotateIcon from '../assets/rotate.jpg'
import zoomIcon from '../assets/zoom.jpg'

const MUSCLE_NODE_NAMES = [
  'Calves','QuadsRecFem','QuadsVasti','Hamstrings','Glutes',
  'ErectorSpinae','Abs','Obliques','SerratusAnterior',
  'ForearmFlexor','ForearmExtensor','Biceps',
  'TricepsLateral','TricepsMedialLong','Rhomboids',
  'Traps','Lats','PecCostal','PecClavicular',
  'DeltRear','DeltSide','DeltFront',
]

function HumanBody({ muscleValues, onHover, mode }) {
  const { nodes } = useGLTF('/3dHuman.glb')
  const materialsRef = useRef(
    Object.fromEntries(
      MUSCLE_NODE_NAMES.map(name => [
        name,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color('#6e7f96'),
          roughness: 0.55, metalness: 0.05,
          emissive: new THREE.Color(0, 0, 0),
          emissiveIntensity: 0.25,
        })
      ])
    )
  )

  useEffect(() => {
    MUSCLE_NODE_NAMES.forEach(name => {
      const mat = materialsRef.current[name]
      if (!mat) return
      const value = muscleValues[name] ?? 0
      const hex = value > 0 ? getColour(value, mode) : '#6e7f96'
      mat.color.set(hex)
      mat.emissive.set(value > 0 ? hex : '#000000')
      mat.emissiveIntensity = 0.25
      mat.needsUpdate = true
    })
  }, [muscleValues, mode])

  const handleOver = useCallback((name, e) => {
    e.stopPropagation()
    onHover(name)
    document.body.style.cursor = 'pointer'
    const mat = materialsRef.current[name]
    if (mat) { mat.emissiveIntensity = 0.9; mat.needsUpdate = true }
  }, [onHover])

  const handleOut = useCallback((name) => {
    onHover(null)
    document.body.style.cursor = 'default'
    const mat = materialsRef.current[name]
    if (mat) { mat.emissiveIntensity = 0.25; mat.needsUpdate = true }
  }, [onHover])

  if (!nodes) return null

  return (
    // Rotate/move the model up so it faces the camera (front-facing by default) needs to match orbit controls
    <group position={[0, 2, -6]} rotation={[-55, 0, 0]}>
      {nodes.Body && (
        <mesh geometry={nodes.Body.geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#b8c4d0" roughness={0.7} metalness={0.0} />
        </mesh>
      )}
      {nodes.Eyes && (
        <mesh geometry={nodes.Eyes.geometry}>
          <meshStandardMaterial color="#e0e8f0" roughness={0.3} />
        </mesh>
      )}
      {MUSCLE_NODE_NAMES.map(name => {
        if (!nodes[name]) return null
        return (
          <mesh
            key={name}
            geometry={nodes[name].geometry}
            material={materialsRef.current[name]}
            onPointerOver={e => handleOver(name, e)}
            onPointerOut={() => handleOut(name)}
            castShadow
          />
        )
      })}
    </group>
  )
}

function Scene({ muscleValues, onHover, mode }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -5]} intensity={0.5} color="#99aaff" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#00e5d4" />
      <HumanBody muscleValues={muscleValues} onHover={onHover} mode={mode} />
      <OrbitControls
        enablePan={false}
        minDistance={0.8}
        maxDistance={20}
        target={[0, 2, -6]}
        // no angle limits so you can move 360 and the target is matched to model position as mentioned on model note above
      />
    </>
  )
}

export default function BodyModel3D({ muscleValues = {}, mode = 'activation', onMuscleHover }) {
  const [tooltip, setTooltip] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const handleHover = useCallback((name) => {
    if (!name) { setTooltip(null); return }
    const config = MUSCLE_CONFIG[name]
    const value = muscleValues[name] ?? 0
    setTooltip({ name, config, value })
    if (onMuscleHover) onMuscleHover(name, value)
  }, [muscleValues, onMuscleHover])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
        padding: '6px 14px',
        fontFamily: 'Inter', fontSize: 11, color: '#8899bb',
        userSelect: 'none', flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 3d model hints and their icons, fixed original backgrounds of the icons as they werent matching the site colour*/}
          <img src={rotateIcon} width="14" height="14" style={{ flexShrink: 0, objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }} alt="rotate" />
          <span>Left click mouse and drag to rotate</span>
        </span>
        <span style={{ color: '#2a3a5a' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={zoomIcon} width="14" height="14" style={{ flexShrink: 0, objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }} alt="zoom" />
          <span>Scroll wheel to zoom</span>
        </span>
      </div>

    <div ref={containerRef} style={{ width: '100%', flex: 1, position: 'relative' }} onMouseMove={handleMouseMove}>
      {/* camera starts facing the model and fov set to 52 so the model doesnt get its feet cut off on initial view */}
      <Canvas camera={{ position: [0, 0.5, 5.5], fov: 52 }} style={{ background: 'transparent' }} shadows>
        <Suspense fallback={null}>
          <Scene muscleValues={muscleValues} onHover={handleHover} mode={mode} />
        </Suspense>
      </Canvas>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: mousePos.x + 14,
          top: Math.min(mousePos.y - 10, (containerRef.current?.clientHeight ?? 600) - 160),
          background: 'rgba(8,14,26,0.96)',
          border: '1px solid rgba(0,229,212,0.35)',
          borderRadius: 8, padding: '10px 14px',
          pointerEvents: 'none', zIndex: 100,
          minWidth: 200, maxWidth: 280,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, color: '#00e5d4', fontSize: 13, marginBottom: 2 }}>
            {tooltip.config?.displayName}
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#8899bb', marginBottom: 6 }}>
            {tooltip.config?.anatomical}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColour(tooltip.value, mode), flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#f0f4ff', fontWeight: 500 }}>
              {tooltip.value}%
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#8899bb' }}>
              {mode === 'fatigue' ? 'fatigue' : 'MVC'}
            </span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#6677aa', lineHeight: 1.4 }}>
            {tooltip.config?.description}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

useGLTF.preload('/3dHuman.glb')
