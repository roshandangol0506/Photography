"use client"

import { useLayoutEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { useMotionValueEvent, type MotionValue } from "framer-motion"
import * as THREE from "three"

// Started as the 21st.dev "cosmos 3D orbit gallery"; now a scroll-driven ring
// of photographs seen from just outside its near edge:
// - The particle sphere and OrbitControls are gone. OrbitControls is what
//   turned the mouse wheel into camera zoom.
// - The camera sits close to the ring, so the near photos are large and sweep
//   across the frame left to right while the far side of the ring shows small
//   and dimmed in the gaps between them, travelling the other way.
// - Each photo sits tangent to the ring, so it turns in perspective as it goes
//   round. When the camera would see a photo's back, the photo flips; that
//   only happens as it passes edge-on, so the flip is never visible.
// - Nothing runs on a clock: the ring is posed entirely from `turn` and
//   `settle`, so it stands still when the reader stops scrolling and runs
//   backwards when they scroll up.
// - Render it in a <Canvas frameloop="demand">: it only asks for a frame when
//   one of its inputs moves or the viewport resizes. It suspends while the
//   textures load, so wrap it in <Suspense>.

interface OrbitGalleryProps {
  /** Ready-to-load URLs. Run large originals through getImageProps first. */
  images: string[]
  /** How far the ring has turned, in radians. */
  turn: MotionValue<number>
  /**
   * 0 while the section is still arriving (the ring rolled steeply and sitting
   * low and to the right), 1 once it has settled into place.
   */
  settle: MotionValue<number>
  /**
   * The settled ring's roll in the screen plane, in radians: positive lifts
   * the right side, negative drops it. Drive it from the scroll to make the
   * ring rock from side to side; without it the ring holds RING_ROLL.
   */
  roll?: MotionValue<number>
}

const RADIUS = 10
// Photos keep their aspect ratio at equal area; a 3:2 photo is ~4.3 wide.
const CARD_SIZE = 3.5
const CARD_WIDTH_3_2 = CARD_SIZE * Math.sqrt(1.5)
// Share of the viewport width the photo nearest the camera fills. Tall
// screens get a larger share, or the photos would be postage stamps.
const NEAR_FILL_WIDE = 0.46
const NEAR_FILL_TALL = 0.85
// The settled pose: the near photos ride a little above the middle of the
// frame (the title sits below them) with the far side just under them, and
// the whole ring is rolled slightly clockwise.
const RING_LIFT = 0.1
const RING_TILT = THREE.MathUtils.degToRad(-2.5)
const RING_ROLL = THREE.MathUtils.degToRad(-11)
// The pose while the section is still scrolling in: rolled steeply the other
// way, set back, and dropped low and right, so smaller photos climb in along
// a diagonal from the bottom of the frame and keep clear of the lead
// paragraph top left.
const ARRIVE_ROLL = THREE.MathUtils.degToRad(28)
const ARRIVE_SHIFT = { x: 2, y: -1.6, z: -4 }
// Opacity of a photo at the very back of the ring (the front is 1). Fading
// rather than darkening lets the far side sink into the section background.
const FAR_OPACITY = 0.4

/** Frames the ring for the current viewport and keeps it framed on resize. */
function CameraRig() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    const aspect = width / height
    // Wide (16:10 and wider) to tall (phone portrait).
    const tallness = THREE.MathUtils.clamp((1.6 - aspect) / 1.1, 0, 1)
    const fill = THREE.MathUtils.lerp(NEAR_FILL_WIDE, NEAR_FILL_TALL, tallness)
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
    // How far in front of the ring the camera stands for the nearest photo
    // to fill `fill` of the width.
    const nearDistance = CARD_WIDTH_3_2 / (fill * 2 * Math.tan(halfFov) * aspect)

    camera.position.set(0, 0, RADIUS + nearDistance)
    camera.lookAt(0, 0, 0)
    invalidate()
  }, [camera, width, height, invalidate])

  return null
}

export function OrbitGallery({ images, turn, settle, roll }: OrbitGalleryProps) {
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  // The camera's position in the ring's own space, reused every frame.
  const eye = useMemo(() => new THREE.Vector3(), [])

  const textures = useTexture(images)

  // The photos are seen at steep angles near the edges of the ring, where
  // plain mipmapping smears them; anisotropic filtering keeps them crisp.
  useLayoutEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy()
    for (const texture of textures) {
      texture.anisotropy = anisotropy
      texture.needsUpdate = true
    }
  }, [gl, textures])

  const cards = useMemo(
    () =>
      textures.map((texture, i) => {
        const { width, height } = texture.image as { width: number; height: number }
        const aspect = width / height
        return {
          texture,
          // Evenly spaced around the ring.
          offset: (i / textures.length) * Math.PI * 2,
          width: CARD_SIZE * Math.sqrt(aspect),
          height: CARD_SIZE / Math.sqrt(aspect),
        }
      }),
    [textures],
  )

  useMotionValueEvent(turn, "change", () => invalidate())
  useMotionValueEvent(settle, "change", () => invalidate())
  // Hooks cannot be conditional, so an absent roll listens to `settle` again.
  useMotionValueEvent(roll ?? settle, "change", () => invalidate())

  useFrame(({ camera }) => {
    const ring = group.current
    if (!ring) return

    const s = THREE.MathUtils.smoothstep(settle.get(), 0, 1)
    ring.rotation.set(
      RING_TILT,
      0,
      THREE.MathUtils.lerp(ARRIVE_ROLL, roll?.get() ?? RING_ROLL, s),
    )
    ring.position.set(
      THREE.MathUtils.lerp(ARRIVE_SHIFT.x, 0, s),
      THREE.MathUtils.lerp(ARRIVE_SHIFT.y, RING_LIFT, s),
      THREE.MathUtils.lerp(ARRIVE_SHIFT.z, 0, s),
    )
    ring.updateMatrixWorld()

    eye.copy(camera.position)
    ring.worldToLocal(eye)
    const nearest = eye.length() - RADIUS
    const farthest = eye.length() + RADIUS
    const t = turn.get()

    cards.forEach(({ offset }, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return

      // A circle on the ring's plane: x = R sin(angle), z = R cos(angle).
      // Angle 0 is the point nearest the camera; as the angle grows, near
      // photos move right and far ones left.
      const angle = offset + t
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)
      mesh.position.set(RADIUS * sin, 0, RADIUS * cos)

      // Tangent to the ring with its face outward; flipped when the camera
      // is on its inner side.
      const facing = (eye.x - RADIUS * sin) * sin + (eye.z - RADIUS * cos) * cos
      mesh.rotation.set(0, facing >= 0 ? angle : angle + Math.PI, 0)

      const depth = (eye.distanceTo(mesh.position) - nearest) / (farthest - nearest)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        1,
        FAR_OPACITY,
        THREE.MathUtils.clamp(depth, 0, 1),
      )
    })
  })

  return (
    <>
      <CameraRig />
      <group ref={group}>
        {cards.map((card, index) => (
          <mesh
            key={index}
            ref={(mesh) => {
              meshes.current[index] = mesh
            }}
          >
            <planeGeometry args={[card.width, card.height]} />
            {/* Transparent, so three.js draws the photos back to front. */}
            <meshBasicMaterial map={card.texture} transparent />
          </mesh>
        ))}
      </group>
    </>
  )
}
