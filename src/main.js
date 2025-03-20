import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Timer } from 'three/addons/misc/Timer'
import './style.css'

const canvas = {
  width: innerWidth,
  height: innerHeight,
  aspect: innerWidth / innerHeight,
  dom: document.getElementById('webgl'),
}

/*
 * Scene & Camera
 */

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(10))

const camera = new THREE.PerspectiveCamera(75, canvas.aspect, 0.1, 1000)
camera.position.set(-20, 20, 20)

const controls = new OrbitControls(camera, canvas.dom)
controls.autoRotate = true
controls.autoRotateSpeed = 0.5
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 16
controls.maxDistance = 36
controls.minPolarAngle = 0.2
controls.maxPolarAngle = Math.PI / 2.2

/*
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)

directionalLight.position.set(20, 20, 20)

scene.add(ambientLight, directionalLight)

/*
 * Konark
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(
  'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
)
// dracoLoader.setDecoderConfig({ type: 'js' })

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
  `/models/temple.glb`,
  (gltf) => {
    console.log('gltf loaded successfully...')

    const model = gltf.scene

    model.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 0.5 // Lower intensity
      }
    })

    model.position.set(0, 0, 0)
    model.scale.setScalar(1)

    // const box = new THREE.Box3().setFromObject(model)
    // const bottomY = box.min.y
    // model.position.y -= bottomY

    scene.add(model)
  },
  null,
  (err) => {
    console.error('Unable to load temple.glb: ', err)
  }
)

/*
 * Renderer & Animation
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas.dom,
})
renderer.setSize(canvas.width, canvas.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const timer = new Timer()

renderer.setAnimationLoop((ts) => {
  const _delta = timer.getDelta()

  controls.update()
  renderer.render(scene, camera)
})

/*
 * Skybox
 */
const rgbeLoader = new RGBELoader()
const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

rgbeLoader.load(`/textures/cloudy.hdr`, (texture) => {
  // (texture)
  const envMap = pmremGenerator.fromEquirectangular(texture)
  texture.mapping = THREE.EquirectangularReflectionMapping

  scene.background = texture
  scene.environment = envMap //envMap

  texture.dispose()
  pmremGenerator.dispose()
  // const envMap = pmremGenerator.fromEquirectangular(texture).texture
  // scene.background = texture // Set HDRI as the background
  // scene.environment = envMap // Set HDRI as the environment map for reflections
  // texture.dispose() // Clean up
  // pmremGenerator.dispose() // Clean up
})

/*
 * Resize & Double-click
 */

window.addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight
  canvas.aspect = innerWidth / innerHeight

  camera.aspect = canvas.aspect
  camera.updateProjectionMatrix()

  renderer.setSize(canvas.width, canvas.height)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

window.addEventListener('dblclick', () => {
  if (canvas.dom.requestFullscreen)
    document.fullscreenElement
      ? document.exitFullscreen()
      : canvas.dom.requestFullscreen()
})
