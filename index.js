// import { html, svg, render } from "https://unpkg.com/lit-html@2.6.1/lit-html.js";
import { html, svg, render } from "./lit-html.js";
import { createListener } from "./createListener.js"
import { runProgram } from "./runProgram.js"
import { downloadGCode } from "./downloadGCode.js"
import { downloadSTL } from "./downloadSTL.js"
import { addProgramEditting } from "./addProgramEditting.js"
import { addBezHandle } from "./addBezHandle.js"
import { addPtHandle } from "./addPtHandle.js"
import { download } from "./download.js";
import { addUpload } from "./addUpload.js";
import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
import { editors } from "./editors.js";
import { bezierEasing } from "./bezierEasing.js";
import { elsAtLoc } from "./elsAtLoc.js"
import { noise } from "./noise.js";

function svg2url(s){
  let ss = `
  <svg width="40" height="40" viewBox="-10 -10 120 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M-20 -20 120 -20 120 120 -20 120" fill="white"/>
    ${s};
  </svg>
  `
  return "data:image/svg+xml,"+encodeURIComponent(ss);
}

function makeIcon(box){
  if (box.opera == 'tor'){
    return 'icons/'+box.type+".png";
  }else{
    if (box.type == 'sine'){
      let {frequency,phase,amplitude,shift} = box;
      let s = `<path d="M `;
      for (let i = 0; i < 100; i++){
        let t = i/100;
        let y = Math.sin((t+phase) * frequency * Math.PI * 2)*amplitude + shift;
        s += i+" ";
        s += (50-y*50)+" "
      }
      s += `" fill="none" stroke="black" stroke-width="3"/>`
      return svg2url(s);
    }else if (box.type == 'bezier'){
      let {start,end,handle0,handle1} = box;
      let s = `<path d="M `;
      for (let i = 0; i < 100; i++){
        let t = i/100;
        let y = bezierEasing(start,handle0,handle1,end)(t);
        s += i+" ";
        s += (50-y*50)+" "
      };
      s += `" fill="none" stroke="black" stroke-width="3"/>`
      return svg2url(s);
    }else if (box.type == 'noise'){
      let {frequency,phase,amplitude,shift} = box;
      let s = `<path d="M `;
      for (let i = 0; i < 100; i++){
        let t = i/100;
        let y = noise((t+phase) * frequency)*amplitude + shift;
        s += i+" ";
        s += (100-y*100)+" "
      }
      s += `" fill="none" stroke="black" stroke-width="3"/>`
      return svg2url(s);
    }else if (box.type == 'thresh'){
      let {thresh, left, right} = box;
      left=100-left*100
      right=100-right*100
      thresh*=100;
      let s = `<path d="M ${0} ${left} ${thresh} ${left} ${thresh} ${right} ${100} ${right}`;
      s += `" fill="none" stroke="black" stroke-width="3"/>`
      return svg2url(s);
    }else if (box.type == 'shape'){
      let {sides} = box;
      let s = `<path d="M `;
      for (let j = 0; j <= sides; j++){
        let a = j/sides * Math.PI*2;
        let x = Math.cos(a);
        let y = Math.sin(a);
        s += (50+x*45)+" ";
        s += (50+y*45)+" ";
      }
      s += `" fill="none" stroke="black" stroke-width="3"/>`
      return svg2url(s);
    }else if (box.type == 'number'){
      let {value} = box;
      let s = `<path d="M ${0} ${50-value*50} 100 ${50-value*50}" fill="none" stroke="black" stroke-width="3"/>`
      s += `<text x="50" y="50" font-family="monospace" font-size="40" text-anchor="middle" alignment-baseline="central">${~~(value*100)/100}</text>`
      return svg2url(s);
    }else if (box.type == 'macro'){
      let {value} = box;
      let s = ``;
      s += `<path d="M0 40 100 40 100 90 0 90 z" fill="none" stroke="black" stroke-width="3"/>`;
      s += `<text x="50" y="18" font-family="monospace" font-size="45" text-anchor="middle" alignment-baseline="central">#</text>`
      s += `<text x="50" y="65" font-family="monospace" font-size="30" text-anchor="middle" alignment-baseline="central">${value}</text>`
      
      return svg2url(s);
    }else{
      return 'icons/warp.png';
    }
  }
}

const STATE = {
  boxes: [ 
    { 
      type: "shape",
      sides: 32,
      opera: "nd",
      color: [400,-50]
    },
    { 
      type: "number",
      value: 1,
      opera: "nd",
      color: [200,0]
    },
    { 
      type: "sine",
      frequency: Math.PI,
      amplitude: 1,
      phase: 0,
      shift: 0,
      opera: "nd",
      color: [200,0]
    },
    { 
      type: "bezier",
      start: 0,
      handle0: [.5, 0],
      handle1: [.5, 1],
      end: 1,
      scale: 1,
      opera: "nd",
      color: [200,0]
    },
    {
      type: "noise",
      frequency: Math.PI,
      amplitude: 1,
      phase: 0,
      shift: 0,
      opera: "nd",
      color: [200,0]
    },
    {
      type: "thresh",
      thresh:0.5,
      left:0,
      right:1,
      opera: "nd",
      color: [200,0]
    },
    { 
      type: "translateX",
      opera: "tor",
      color: [50,0]
    }, 
    { 
      type: "translateY",
      opera: "tor",
      color: [50,0]
    }, 
    { 
      type: "scaleX",
      direction: "x",
      opera: "tor",
      color: [50,0]
    },
    { 
      type: "scaleY",
      direction: "y",
      opera: "tor",
      color: [50,0]
    },
    { 
      type: "scale",
      direction: "xy",
      opera: "tor",
      color: [50,0]
    },
    { 
      type: "rotate",
      opera: "tor",
      color: [50,0]
    },
    { 
      type: "union",
      opera: "tor",
      color: [200,100]
    },
    { 
      type: "difference",
      opera: "tor",
      color: [200,100]
      
    },
    { 
      type: "intersection",
      opera: "tor",
      color: [200,100]
    },
    { 
      type: "warp",
      opera: "tor",
      color: [200,-60]
    },
    { 
      type: "smooth",
      opera: "tor",
      color: [200,-60]
    },
    // { 
    //   type: "point",
    //   value: [0, 0],
    //   // icon: "Pt",
    //   text: "Pt",
    //   opera: "nd"
    // },
    { 
      type: "multiply",
      opera: "tor",
      color: [200,30]
    },
    { 
      type: "plus",
      opera: "tor",
      color: [200,30]
    },  
    { 
      type: "composite",
      opera: "tor",
      color: [200,30]
    },
    // { 
    //   type: "macro",
    //   value: "",
    //   color: [500,-160]
    // },
    { 
      type: "code",
      value: "t=>{\n  return t;\n}",
      opera: "tor",
      color: [0,0]
    },
  ],
  programs: {
    "main": [ ]
  },
  dragId: null,
  mouse: {x: 0, y: 0},
  result: null,
  height: 5,
  layers: 80,
  scale: 10,
  threeLines: [],
  editor: null,
  editValue: null
}



let macroCount = 0;
function view(state) {
  return html`
    <div class="root">
      <div class="view-window" style="position: relative;">
        <div class="render-target" style="height: 100%;"></div>
        <div class="height-layers">
          <div style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="padding-right: 5px;">height</span><input style="width: 70px;" .value=${state.height} @input=${e => { state.height = Number(e.target.value)}}/>
          </div>
          <div style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="padding-right: 5px;">layers</span><input style="width: 70px;" .value=${state.layers} @input=${e => { state.layers = Number(e.target.value)}}/>
          </div>
          <div style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="padding-right: 5px;">scale</span><input style="width: 70px;" .value=${state.scale} @input=${e => { state.scale = Number(e.target.value)}}/>
          </div>
          <div style="padding: 5px; display: flex; justify-content: space-between;">
            Layer Height: ${(state.height*state.scale/state.layers).toFixed(2)}
          </div>
        </div>
      </div>

      <div class="box-container">${state.boxes.map(box)}</div>

      <div class="dictionary">
        ${prioritizeKey(Object.entries(state.programs), "main").map(drawProgram)}
      </div>
      <div style="display: flex; justify-content: space-evenly; padding: 5px; height: min-content;">
        <button style="width: 150px; height: 100%;" @click=${() => {
          const json = JSON.stringify(state.programs);
          download("pot", "json", json);
        }}>save</button>
        <button style="width: 150px; height: 100%;" @click=${evalProgram}>run</button>
        <button style="width: 150px; height: 100%;" @click=${() => downloadGCode(state)}>download gcode</button>
        <button style="width: 150px; height: 100%;" @click=${() => downloadSTL(state)}>download stl</button>
        <button style="width: 150px; height: 100%;" @click=${() => {
          state.programs[`m${macroCount}`] = [];
          macroCount++;
        }}>new macro</button>
      </div>
      ${drawDragged(state.dragId, state.mouse)}
      ${drawEditor(state.editor, state.editValue)}
    </div>
  `
}

function prioritizeKey(entries, key) {
  return entries.sort((a, b) => (b[0] === key) - (a[0] === key));
}

const box = (box, index) => html`
  <div 
    class="box" 
    data-index=${index}
    style=${`
      background-image: url("${makeIcon(box)}"); 
      background-size: cover; 
      background-position: center;
      border: 1px solid black;
      border-radius: 3px; 
      display: flex;
      align-items: center;
      font-size: xx-large;
      justify-content: center;
      filter: sepia(100%) saturate(${box?.color ? box.color[0] : 0}%) hue-rotate(${box?.color ? box.color[1] : 0}deg);
    `}>
    ${!box.icon ? box.text : ""}
  </div>
`

const draggableBox = (box, index, name) => {
  if (!box) return "";

  return html`
    <div 
      class="draggable-box" 
      data-index=${index}
      data-program-name=${name}
      style=${`
        background-image: url("${makeIcon(box)}"); 
        background-size: cover; 
        background-position: center;
        border: 1px solid black;
        border-radius: 3px; 
        display: flex;
        align-items: center;
        font-size: xx-large;
        justify-content: center;
        filter: sepia(100%) saturate(${box?.color ? box.color[0] : 0}%) hue-rotate(${box?.color ? box.color[1] : 0}deg);
      `}>
      ${!box.icon ? box.text : ""}
    </div>
        
      </div>
  `
}

const drawProgram = ([programName, programData]) => html`
  <div class="program">
    <div class="program-name">
        <div 
          class="macro-name"
          .data=${programName}
          style=${`
              display: flex;
              width: 50px;
              height: 50px;
              background: white;
              border: 1px solid black;
              border-radius: 3px;
              display: flex;
              align-items: center;
              font-size: large;
              justify-content: center;
            `}>
      
          ${programName}
          
        </div>
    </div>
    <div class="program-boxes">
      ${programData.map( (box, index) => draggableBox(box, index, programName) )}
      <div 
        class="program-spacer-end" 
        data-program-name=${programName}
        data-index=${programData.length}
        style="aspect-ratio: 1; width: 100%; padding: 5px; margin: 5px; height: 40px;"></div>
    </div>
  </div>
`

const drawDragged = (box, mouse) => box === null ? "" : html`
  <div 
    style=${`
      position: absolute; 
      width: 50px;
      height: 50px;
      background-image: url("${makeIcon(box.data)}"); 
      background-size: cover; 
      background-position: center;
      border: 1px solid black;
      border-radius: 3px;
      left:${mouse.x-box.shiftX}px; 
      top:${mouse.y-box.shiftY}px;
      display: flex;
      align-items: center;
      font-size: xx-large;
      justify-content: center;
      filter: sepia(100%) saturate(${box?.data?.color ? box?.data?.color[0] : 0}%) hue-rotate(${box?.data?.color ? box?.data?.color[1] : 0}deg);
      `}>
      
      ${!box.data.icon ? box.data.text : ""}
      
  </div>
`

function drawEditor(editor) {
  if (editor === null) return "";

  const editorView = editors[editor.type];

  return html`
    <div class="editor-modal">
      <div style="font-size: large; font-weight: 900;">${editor.type}</div>
      ${editorView ? editorView(editor) : ""}
      <button @click=${e => {
        STATE.editor = null;
      }}>close editor</button>
    </div>
  `
}

const renderLoop = () => {
  render(view(STATE), document.body);
  requestAnimationFrame(renderLoop);
}

renderLoop();

window.addEventListener("pointermove", e => {
  // STATE.domPath = e.composedPath();
  // console.log(STATE.domPath);
  STATE.mouse.x = e.clientX;
  STATE.mouse.y = e.clientY;
})

addProgramEditting(STATE);
addBezHandle(STATE);
addPtHandle(STATE);

window.STATE = STATE;


function renderLines(domElement) {
  // Get the dimensions of the DOM element
  const width = domElement.clientWidth;
  const height = domElement.clientHeight;

  // Create a scene
  const scene = new THREE.Scene();

  // Add a base plane (GridHelper)
  const size = 10;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  // Create a camera with the aspect ratio of the DOM element
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // Create a renderer and set its size to the dimensions of the DOM element
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  domElement.appendChild(renderer.domElement);


  // Add OrbitControls for panning and zooming
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // required if controls.enableDamping or controls.autoRotate are set to true
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 2;

  // Animation
  function animate() {
    const id = requestAnimationFrame(animate);
    controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);

    return id;
  }

 animate();

 window.onresize = function(){
  renderer.setSize(domElement.clientWidth,domElement.clientHeight);
 }

 return scene;
}

addUpload(document.body, STATE);

STATE.scene = renderLines(document.querySelector(".render-target"));

function addLines(scene, lines, lineThickness = 0.015) {
  while (STATE.threeLines.length) {
    const threeLine = STATE.threeLines.pop();
    STATE.scene.remove(threeLine);
  }

  // Create a material
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: lineThickness,
  });

  const threeLines = [];
  lines.forEach(polyline => {
    const geometry = new THREE.BufferGeometry().setFromPoints(polyline.map(pt => new THREE.Vector3(pt[0], pt[2], pt[1])));
    const line = new THREE.Line(geometry, material);
    threeLines.push(line);
    scene.add(line);
  });

  STATE.threeLines = threeLines;

}

function evalProgram() {

  const fn = runProgram(STATE);

  const { height, layers } = STATE;
  const shape = [];

  for (let i = 0; i < layers; i += 1) { 
    const t = i/(layers-1);
    const z = t*height;
    const pls = fn(t).map(pl => pl.map(pt => [...pt, z]));
    shape.push(pls);
  }




  addLines(STATE.scene, shape.flat());

  return shape;
     
}

window.evalProgram = evalProgram;

