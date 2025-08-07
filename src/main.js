import './style.css'
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { computeTangentsForNonIndexed } from './utils'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui';



const lil = new GUI()

const canvas = document.querySelector('canvas')

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})
renderer.setClearColor(0x050505)

const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,1,1000)
camera.position.z = 5

const controls = new OrbitControls(camera,canvas)


const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)



const material = new THREE.MeshPhysicalMaterial({
  color:0xff6f2a,
  metalness:.7,
  roughness:.6
})

const csm = new CustomShaderMaterial({
  baseMaterial:material,
  vertexShader,
  fragmentShader,
  uniforms:{
    uTime:{value:0},
    PositionFactor:{value:.5},
    OutputFactor:{value:15},
    DisplaceFactor:{value:2},
    Speed:{value:1},
  }
})

const Blob = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.5,100),
  csm
)

computeTangentsForNonIndexed(Blob.geometry)

console.log(Blob.geometry)


lil.add(Blob.material.uniforms.PositionFactor,'value').min(0).max(5).name('Position Factor')
lil.add(Blob.material.uniforms.OutputFactor,'value').min(0).max(20).name('Output Factor')
lil.add(Blob.material.uniforms.DisplaceFactor,'value').min(0).max(10).name('Displacement Factor')
lil.add(Blob.material.uniforms.Speed,'value').min(0).max(2).name('Speed')


scene.add(Blob)

const Amb = new THREE.AmbientLight(0xffffff,1.5)
const dir = new THREE.DirectionalLight(0xffffff,1)
dir.position.set(4,4,-4)

const front = new THREE.DirectionalLight(0xffffff,2)
front.position.set(4,-4,6)

const back = new THREE.DirectionalLight(0xffffff,2)
back.position.set(-5,1,0)

const top = new THREE.DirectionalLight(0xffffff,1)
top.position.set(-5,10,2)


scene.add(Amb,dir,front,back,top)


const clock = new THREE.Clock()
let PrevTime = clock.getElapsedTime()

function Animate(){

  const TIME = clock.getElapsedTime();
  const DT = TIME - PrevTime;

  Blob.material.uniforms.uTime.value = TIME;
  renderer.render(scene,camera)
  requestAnimationFrame(Animate)
}

requestAnimationFrame(Animate)


function resize(){
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth,innerHeight)
}

window.addEventListener('resize',resize)
