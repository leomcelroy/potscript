import { download } from "./download.js";
import { MarchVoxels } from "./marchingcubes.js";

function get_bbox(points){
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity
  for (let i = 0;i < points.length; i++){
    let [x,y] = points[i];
    xmin = Math.min(xmin,x);
    ymin = Math.min(ymin,y);
    xmax = Math.max(xmax,x);
    ymax = Math.max(ymax,y);
  }
  return {x:xmin,y:ymin,w:xmax-xmin,h:ymax-ymin};
}

export function rasterize(layers, res=32){
  let bb = get_bbox(layers.flat().flat());
  let cnv = document.createElement("canvas");
  let pad = 10;
  let W = ~~(bb.w*res+pad*2);
  let H = ~~(bb.h*res+pad*2);
  cnv.width = W;
  cnv.height = H;
  // cnv.style="position:absolute;z-index:10000;"
  // document.body.appendChild(cnv)
  let oo = new Array(W*H).fill(0);
  let ctx = cnv.getContext('2d');
  for (let i = 0; i < layers.length; i++){
    console.log(i,'/',layers.length)
    ctx.fillStyle="black";
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle="white";
    for (let j = 0; j < layers[i].length; j++){
      ctx.beginPath();
      for (let k = 0; k < layers[i][j].length; k++){
        let [x,y] = layers[i][j][k];
        ctx[k?'lineTo':'moveTo'](pad+(x-bb.x)*res,pad+(y-bb.y)*res);
      }
      ctx.fill();
    }
    ctx.filter="blur(2px)"
    let data = ctx.getImageData(0,0,W,H).data;
    // let o = [];
    for (let j = 0; j < W*H; j++){
      oo.push(data[j*4]/255);
    }
    // oo.push(o);
  }
  return [oo.concat(new Array(W*H).fill(0)),W,H,layers.length];
}

function to_stl(faces){
  let o = `solid\n`;

  for (let i = 0; i < faces.length; i++){
    let [a,b,c] = faces[i];
    o += `
  facet normal 0 0 0
    outer loop
      vertex ${a[0]} ${a[1]} ${a[2]}
      vertex ${b[0]} ${b[1]} ${b[2]}
      vertex ${c[0]} ${c[1]} ${c[2]}
    endloop
  endfacet
`;
  }
  o += `endsolid`;
  return o;
}


export function downloadSTL({ scale }) {
  let old_layers = STATE.layers;
  STATE.layers *= 4;
  const layers = evalProgram();
  STATE.layers = old_layers;
  evalProgram();

  let [vox,w,h,d] = rasterize(layers);
  let trigs = MarchVoxels(vox,w,h,d);
  let stl = to_stl(trigs);
  download("pot-stl", "stl", stl);

}





