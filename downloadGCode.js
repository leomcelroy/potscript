import { download } from "./download.js";

export function downloadGCode({ scale, height, layers }) {
   const layerShapes = evalProgram();

   console.log(layerShapes);

   const totalHeight = scale*height;
   const layerHeight = totalHeight/layers;


   const lines = [];
   let lastPt = null;
   let totalE = 0;
   

   layerShapes.forEach(pls => {
      pls.forEach((pl) => {
         pl.forEach((pt, i) => {
            pt = pt.map(x => x*scale);
            let [ x, y, z ] = pt;
            z += layerHeight;
            if (i === 0) {
               lines.push(`G1 X${x} Y${y} Z${z} F1998 E${totalE}`); //add some retraction when going to new curve
            } 

            const eDelta = i > 0 ? dist(lastPt, pt)/8 : 0;
            totalE += eDelta
         
            lines.push(`G1 X${x} Y${y} Z${z} F1998 E${totalE}`);

            lastPt = pt;
         })
      })
   })

   const gcode = `
    G90
    M82
    M106 S0
    M104 S0 T0
    G28 ; home all axes
    M92 E400
    G1 Z2.800 F3600
    G92 E0
    T0
    ${lines.join("\n")}
    M104 S0 ; turn off extruder
    M140 S0 ; turn off bed
    G28 ; home all axes
    M84 ; disable motors
   `

   // console.log(gcode);
   download("pot-gcode", "gcode", gcode);
}

function dist([x1, y1, z1], [x2, y2, z2]) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dz = z2 - z1;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}