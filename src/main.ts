import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh';
//import Turtle from './l-systems/turtle';
//import ExpansionRule from './l-systems/expansionrule';
import LSystem from './l-systems/lsystem';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  'Elevation View': true,
  'Population View': false,
  'Overlay': false,
};

let square: Square;
let screenQuad: ScreenQuad;
let mesh_stem: Mesh;
let mesh_bud: Mesh;
let numInst: number = 4;

let time: number = 0.0;
let obj0: string = readTextFile('../resources/obj/stem.obj');
let obj1: string = readTextFile('../resources/obj/bud.obj');

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // call l-system stuff
  let alphabet = new Array<string>();
  alphabet.push("F");
  alphabet.push("X");
  alphabet.push("L");
  //alphabet.push("H");
  //alphabet.push("G");
  alphabet.push("+");
  alphabet.push("-");
  alphabet.push("[");
  alphabet.push("]");
  let lsys = new LSystem("FXL", alphabet, numInst);
  //let lsys = new LSystem("HG", alphabet, numInst);

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  //let offsetsArray = [];
  let colorsArray = [];
  let transf1Array = [];
  let transf2Array = [];
  let transf3Array = [];

  let k: number = (lsys.transfvecs.length);
  k = k / 3.0;
  for (let kcount = 0; kcount < k; kcount++) {
      transf1Array.push(lsys.transfvecs[0+ 3*kcount][0]);
      transf1Array.push(lsys.transfvecs[1+ 3*kcount][0]);
      transf1Array.push(lsys.transfvecs[2+ 3*kcount][0]);
      transf2Array.push(lsys.transfvecs[0+ 3*kcount][1]);
      transf2Array.push(lsys.transfvecs[1+ 3*kcount][1]);
      transf2Array.push(lsys.transfvecs[2+ 3*kcount][1]);
      transf3Array.push(lsys.transfvecs[0+ 3*kcount][2]);
      transf3Array.push(lsys.transfvecs[1+ 3*kcount][2]);
      transf3Array.push(lsys.transfvecs[2+ 3*kcount][2]);

      colorsArray.push(lsys.colors[kcount][0]);
      colorsArray.push(lsys.colors[kcount][1]);
      colorsArray.push(lsys.colors[kcount][2]);
      colorsArray.push(lsys.colors[kcount][3]);
  }
  
  let colors: Float32Array = new Float32Array(colorsArray);
  let transf1: Float32Array = new Float32Array(transf1Array);
  let transf2: Float32Array = new Float32Array(transf2Array);
  let transf3: Float32Array = new Float32Array(transf3Array);

  square.setNumInstances(k);
  square.setInstanceVBOs(colors, transf1, transf2, transf3);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'Elevation View');
  gui.add(controls, 'Population View');
  gui.add(controls, 'Overlay');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND); // Alpha blending
  gl.enable(gl.DEPTH_TEST);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad], 
      controls["Elevation View"],
      controls["Population View"], controls["Overlay"]);
    renderer.render(camera, instancedShader, [square], false, false, false);
    /*
    renderer.render(camera, instancedShader, [
      mesh_stem
    ], false, false, false);
    renderer.render(camera, instancedShader, [
      mesh_bud
    ], false, false, false);*/
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
