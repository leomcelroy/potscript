import { html, svg, render } from "./lit-html.js";
import { noise } from "./noise.js";

export const editors = {
  "shape": (value) => html`
    <div>Number of Sides: ${value.sides.toFixed(0)}</div>
    <input 
      type="range" 
      min="3" 
      max="100" 
      step="1"
      .value=${value.sides} 
      @input=${e => {
        value.sides = Number(e.target.value);
        evalProgram();
      }}>
  `,
  "sine": (value) => html`
    <div>Frequency: ${value.frequency.toFixed(3)}</div>
    <input 
      type="range" 
      min="0" 
      max="10"
      step="0.00001" 
      .value=${value.frequency} 
      @input=${e => {
        value.frequency = Number(e.target.value);
        evalProgram();
      }}>

    <div>Amplitude: ${value.amplitude.toFixed(3)}</div>
    <input 
      type="range" 
      min="0" 
      max="2"
      step="0.001"  
      .value=${value.amplitude} 
      @input=${e => {
        value.amplitude = Number(e.target.value);
        evalProgram();
      }}>

    <div>Phase: ${value.phase.toFixed(3)}</div>
    <input 
      type="range" 
      min="-2" 
      max="2"
      step="0.0001"  
      .value=${value.phase} 
      @input=${e => {
        value.phase = Number(e.target.value);
        evalProgram();
      }}>

    <div>Shift: ${value.shift.toFixed(3)}</div>
    <input 
      type="range" 
      min="-2" 
      max="2"
      step="0.0001"  
      .value=${value.shift} 
      @input=${e => { 
        value.shift = Number(e.target.value); 
        evalProgram();
      }}>

    <style>
      .sin-viz {
        background: white;
        transform: scale(1, -1);
        border: 1px solid black;
        border-radius: 3px;
      }
    </style>
    <svg class="sin-viz" width="250" height="250" viewBox="-5 -5 10 10" xmlns="http://www.w3.org/2000/svg">
      ${drawGrid({
        xMin: -5,
        xMax: 5,
        xStep: 1,
        yMin: -5,
        yMax: 5,
        yStep: 1,
      })}

      ${drawSine(value)}
    </svg>
  `,
  "noise": (value) => html`
    <div>Frequency: ${value.frequency.toFixed(3)}</div>
    <input 
      type="range" 
      min="0" 
      max="10"
      step="0.00001" 
      .value=${value.frequency} 
      @input=${e => {
        value.frequency = Number(e.target.value);
        evalProgram();
      }}>

    <div>Amplitude: ${value.amplitude.toFixed(3)}</div>
    <input 
      type="range" 
      min="0" 
      max="2"
      step="0.001"  
      .value=${value.amplitude} 
      @input=${e => {
        value.amplitude = Number(e.target.value);
        evalProgram();
      }}>

    <div>Phase: ${value.phase.toFixed(3)}</div>
    <input 
      type="range" 
      min="-2" 
      max="2"
      step="0.0001"  
      .value=${value.phase} 
      @input=${e => {
        value.phase = Number(e.target.value);
        evalProgram();
      }}>

    <div>Shift: ${value.shift.toFixed(3)}</div>
    <input 
      type="range" 
      min="-2" 
      max="2"
      step="0.0001"  
      .value=${value.shift} 
      @input=${e => { 
        value.shift = Number(e.target.value); 
        evalProgram();
      }}>

    <style>
      .sin-viz {
        background: white;
        transform: scale(1, -1);
        border: 1px solid black;
        border-radius: 3px;
      }
    </style>
    <svg class="sin-viz" width="250" height="250" viewBox="-5 -5 10 10" xmlns="http://www.w3.org/2000/svg">
      ${drawGrid({
        xMin: -5,
        xMax: 5,
        xStep: 1,
        yMin: -5,
        yMax: 5,
        yStep: 1,
      })}

      ${drawNoise(value)}
    </svg>
  `,
  "thresh": (value) => html`
  <div>Threshold: ${value.thresh.toFixed(3)}</div>
  <input
  .value=${value.thresh} 
  @input=${e => {
    let n = Number(e.target.value);
    if (!isNaN(n) && e.target.value.length){
      value.thresh = n;
    }
    evalProgram();
  }}>
  <input 
    type="range" 
    min="0" 
    max="1"
    step="0.00001" 
    .value=${value.thresh} 
    @input=${e => {
      value.thresh = Number(e.target.value);
      evalProgram();
    }}>

  <div>Left: ${value.left.toFixed(3)}</div>
  <input
  .value=${value.left} 
  @input=${e => {
    let n = Number(e.target.value);
    if (!isNaN(n) && e.target.value.length){
      value.left = n;
    }
    evalProgram();
  }}>
  <input 
    type="range" 
    min="-10" 
    max="10"
    step="0.001"  
    .value=${value.left} 
    @input=${e => {
      value.left = Number(e.target.value);
      evalProgram();
    }}>

  <div>Right: ${value.right.toFixed(3)}</div>
  <input
  .value=${value.right} 
  @input=${e => {
    let n = Number(e.target.value);
    if (!isNaN(n) && e.target.value.length){
      value.right = n;
    }
    evalProgram();
  }}>
  <input 
    type="range" 
    min="-10" 
    max="10"
    step="0.0001"  
    .value=${value.right} 
    @input=${e => {
      value.right = Number(e.target.value);
      evalProgram();
    }}>
  <style>
    .sin-viz {
      background: white;
      transform: scale(1, -1);
      border: 1px solid black;
      border-radius: 3px;
    }
  </style>
  <svg class="sin-viz" width="250" height="250" viewBox="-5 -5 10 10" xmlns="http://www.w3.org/2000/svg">
    ${drawGrid({
      xMin: -5,
      xMax: 5,
      xStep: 1,
      yMin: -5,
      yMax: 5,
      yStep: 1,
    })}

    ${drawThresh(value)}
  </svg>
`,
  "bezier": (value) => svg`
  <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; flex-direction:column;">
  <style>
    .bez-ctrl {
      background: white;
      transform: scale(1, -1);
      border: 1px solid black;
      border-radius: 3px;
    }
  </style>
  <svg class="bez-ctrl" width="250" height="250" viewBox="0.05 -1.05 1.1 2.1" xmlns="http://www.w3.org/2000/svg">
    ${drawGrid({
      xMin: 0,
      xMax: 1,
      xStep: 0.1,
      yMin: -1,
      yMax: 1,
      yStep: 0.1,
    })}
   <path d="M0,${value.start} C ${value.handle0[0]},${value.handle0[1]} ${value.handle1[0]},${value.handle1[1]} 1,${value.end}" stroke-width=".05px" stroke="black" fill="none"/>
    <line x1="0" y1=${value.start} x2=${value.handle0[0]} y2=${value.handle0[1]} stroke="black" stroke-width="0.01" stroke-dasharray="0.02,0.02" />
    <line x1=${value.handle1[0]} y1=${value.handle1[1]} x2="1" y2=${value.end} stroke="black" stroke-width="0.01" stroke-dasharray="0.02,0.02" />
    
    <circle class="bez-handle" .value=${{ idx: "start", value }} cx="0" cy=${value.start} r=".05" fill="red"/>
    <circle class="bez-handle" .value=${{ idx: "handle0", value }} cx=${value.handle0[0]} cy=${value.handle0[1]} r=".05" fill="red"/>
    <circle class="bez-handle" .value=${{ idx: "handle1", value }} cx=${value.handle1[0]} cy=${value.handle1[1]} r=".05" fill="red"/>
    <circle class="bez-handle" .value=${{ idx: "end", value }} cx="1" cy=${value.end} r=".05" fill="red"/>

</svg>
      start: ${value.start.toFixed(2)},
      handle0: [${value.handle0[0].toFixed(1)}, ${value.handle0[1].toFixed(1)}],
      handle1: [${value.handle1[0].toFixed(1)}, ${value.handle1[1].toFixed(1)}],
      end: ${value.end.toFixed(2)}
     <div>scale: ${value.scale}</div>
     <input 
      type="range" 
      min="0" 
      max="20"
      step="0.01"  
      .value=${value.scale} 
      @input=${e => {
        value.scale = Number(e.target.value);
        evalProgram();
      }}>
 </div>
  `,
  "point": (value) => svg`
    <style>
      .pt-ctrl {
        background: white;
        transform: scale(1, -1);
        border: 1px solid black;
        border-radius: 3px;
      }
    </style>
    <svg class="pt-ctrl" width="250" height="250" viewBox="-1.05 -1.05 2.1 2.1" xmlns="http://www.w3.org/2000/svg">
      ${drawGrid({
        xMin: -1,
        xMax: 1,
        xStep: 0.1,
        yMin: -1,
        yMax: 1,
        yStep: 0.1,
      })}
      <circle class="pt-handle" cx=${value.value[0]} cy=${value.value[1]} r=".05" fill="red" .value=${{ value }}/>
    </svg>
    pt: ${value.value[0].toFixed(1)}, ${value.value[1].toFixed(1)}
  `,
  "macro": (value) => html`
    <div>macro name: ${value.value}</div>
    <input @input=${e => value.value = e.target.value} .value=${value.value}/>
  `,
  "number": (value) => html`
    <div>Number: ${value.value.toFixed(2)}</div>
    <input 
    .value=${value.value} 
    @input=${e => {
      let n = Number(e.target.value);
      if (!isNaN(n) && e.target.value.length){
        value.value = n;
      }
      evalProgram();
    }}>
    <input 
      type="range" 
      min="-20" 
      max="20" 
      step=".01"
      .value=${value.value} 
      @input=${e => {
        value.value = Number(e.target.value);
        evalProgram();
      }}>
    `,
  "code": (value) => html`
    <textarea @input=${e => value.value = e.target.value} .value=${value.value} cols="48" rows="24"></textarea>
  `,
}


const drawGrid = ({ xMin, xMax, xStep, yMin, yMax, yStep }) => {
  const xLines = [];
  for (let i = xMin; i <= xMax; i += xStep) {
    xLines.push(svg`<line x1=${i} y1=${yMin} x2=${i} y2=${yMax} />`)
  }

  const yLines = [];
  for (let i = yMin; i <= yMax; i += yStep) {
    yLines.push(svg`<line x1=${xMin} y1=${i} x2=${xMax} y2=${i} />`)
  }


  return svg`
    <!-- Draw vertical grid lines -->
    <g stroke="lightgray" stroke-width="0.005">
      ${xLines}
    </g>

    <!-- Draw horizontal grid lines -->
    <g stroke="lightgray" stroke-width="0.005">
      ${yLines}
    </g>

  `
}

function drawSine({ frequency, amplitude, phase, shift}) {
  const pts = [];

  for (let i = -5; i <= 5; i += 0.001) {
    let x = i;
    let y = Math.sin((x+phase) * frequency * Math.PI * 2)*amplitude + shift;
    pts.push([x, y]);
  }

  return svg`<path d=${pointsToPath(pts)} stroke-width="0.02" stroke="black" fill="none">`
}
function drawNoise({ frequency, amplitude, phase, shift}) {
  const pts = [];

  for (let i = -5; i <= 5; i += 0.001) {
    let x = i;
    let y = noise((x+phase) * frequency )*amplitude + shift;
    pts.push([x, y]);
  }

  return svg`<path d=${pointsToPath(pts)} stroke-width="0.02" stroke="black" fill="none">`
}

function drawThresh({ thresh, left, right}) {
  const pts = [];
  for (let i = -5; i <= 5; i += 0.001) {
    let x = i;
    let y = (i < thresh) ? left : right
    pts.push([x, y]);
  }
  return svg`<path d=${pointsToPath(pts)} stroke-width="0.02" stroke="black" fill="none">`
}

function pointsToPath(points) {
    if (points.length === 0) {
        return "";
    }
    
    const [firstPoint, ...restOfPoints] = points;
    const moveTo = `M ${firstPoint[0]},${firstPoint[1]}`;
    const lineTos = restOfPoints.map(pt => `L ${pt[0]},${pt[1]}`).join(" ");
    return `${moveTo} ${lineTos}`;
}

