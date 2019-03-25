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
  alphabet.push("L");
  alphabet.push("X");
  alphabet.push("+");
  alphabet.push("-");
  alphabet.push("[");
  alphabet.push("]");
  let lsys = new LSystem("FXL", alphabet, numInst);

  // build meshes
  mesh_stem = new Mesh(obj0, vec3.fromValues(0,0,0));
  mesh_stem.create();

  mesh_bud = new Mesh(obj1, vec3.fromValues(0,0,0));
  mesh_bud.create();

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
  let transf4Array = [];

  let bcolorsArray = [];
  let btransf1Array = [];
  let btransf2Array = [];
  let btransf3Array = [];
  let btransf4Array = [];
  let k: number = (lsys.transfvecs.length);
  k = k / 4.0;
  for (let kcount = 0; kcount < k; kcount++) {
      transf1Array.push(lsys.transfvecs[0+ 4*kcount][0]);
      transf1Array.push(lsys.transfvecs[1+ 4*kcount][0]);
      transf1Array.push(lsys.transfvecs[2+ 4*kcount][0]);
      transf1Array.push(lsys.transfvecs[3+ 4*kcount][0]);
      transf2Array.push(lsys.transfvecs[0+ 4*kcount][1]);
      transf2Array.push(lsys.transfvecs[1+ 4*kcount][1]);
      transf2Array.push(lsys.transfvecs[2+ 4*kcount][1]);
      transf2Array.push(lsys.transfvecs[3+ 4*kcount][1]);
      transf3Array.push(lsys.transfvecs[0+ 4*kcount][2]);
      transf3Array.push(lsys.transfvecs[1+ 4*kcount][2]);
      transf3Array.push(lsys.transfvecs[2+ 4*kcount][2]);
      transf3Array.push(lsys.transfvecs[3+ 4*kcount][2]);
      transf4Array.push(lsys.transfvecs[0+ 4*kcount][3]);
      transf4Array.push(lsys.transfvecs[1+ 4*kcount][3]);
      transf4Array.push(lsys.transfvecs[2+ 4*kcount][3]);
      transf4Array.push(lsys.transfvecs[3+ 4*kcount][3]);

      colorsArray.push(lsys.colors[kcount][0]);
      colorsArray.push(lsys.colors[kcount][1]);
      colorsArray.push(lsys.colors[kcount][2]);
      colorsArray.push(lsys.colors[kcount][3]);
  }
  let bcount = lsys.btransfvecs.length / 4.0;
  for (let b = 0; b < bcount; b++) {
      btransf1Array.push(lsys.btransfvecs[0+ 4*b][0]);
      btransf1Array.push(lsys.btransfvecs[1+ 4*b][0]);
      btransf1Array.push(lsys.btransfvecs[2+ 4*b][0]);
      btransf1Array.push(lsys.btransfvecs[3+ 4*b][0]);
      btransf2Array.push(lsys.btransfvecs[0+ 4*b][1]);
      btransf2Array.push(lsys.btransfvecs[1+ 4*b][1]);
      btransf2Array.push(lsys.btransfvecs[2+ 4*b][1]);
      btransf2Array.push(lsys.btransfvecs[3+ 4*b][1]);
      btransf3Array.push(lsys.btransfvecs[0+ 4*b][2]);
      btransf3Array.push(lsys.btransfvecs[1+ 4*b][2]);
      btransf3Array.push(lsys.btransfvecs[2+ 4*b][2]);
      btransf3Array.push(lsys.btransfvecs[3+ 4*b][2]);
      btransf4Array.push(lsys.btransfvecs[0+ 4*b][3]);
      btransf4Array.push(lsys.btransfvecs[1+ 4*b][3]);
      btransf4Array.push(lsys.btransfvecs[2+ 4*b][3]);
      btransf4Array.push(lsys.btransfvecs[3+ 4*b][3]);

      bcolorsArray.push(lsys.bcolors[b][0]);
      bcolorsArray.push(lsys.bcolors[b][1]);
      bcolorsArray.push(lsys.bcolors[b][2]);
      bcolorsArray.push(lsys.bcolors[b][3]);
  }
  
  console.log(btransf1Array);
  console.log(btransf2Array);
  console.log(btransf3Array);
  console.log(btransf4Array);
  console.log(lsys.btransfvecs);
  
  let colors: Float32Array = new Float32Array(colorsArray);
  let transf1: Float32Array = new Float32Array(transf1Array);
  let transf2: Float32Array = new Float32Array(transf2Array);
  let transf3: Float32Array = new Float32Array(transf3Array);
  let transf4: Float32Array = new Float32Array(transf4Array);

  let bcolors: Float32Array = new Float32Array(bcolorsArray);
  let btransf1: Float32Array = new Float32Array(btransf1Array);
  let btransf2: Float32Array = new Float32Array(btransf2Array);
  let btransf3: Float32Array = new Float32Array(btransf3Array);
  let btransf4: Float32Array = new Float32Array(btransf4Array);

  //mesh_stem.setNumInstances(k);
  //mesh_stem.setVBOTransform(colors, transf1, transf2, transf3, transf4);

  //mesh_bud.setNumInstances(bcount);
  //mesh_bud.setVBOTransform(bcolors, btransf1, btransf2, btransf3, btransf4);

  square.setNumInstances(k);
  square.setInstanceVBOs(colors, transf1, transf2, transf3, transf4);

  let offsetsArray = [];
  let ccolorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      ccolorsArray.push(i / n);
      ccolorsArray.push(j / n);
      ccolorsArray.push(1.0);
      ccolorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let ccolors: Float32Array = new Float32Array(ccolorsArray);
  //square.setInstance2VBOs(offsets, ccolors);
  //square.setNumInstances(n * n);
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
