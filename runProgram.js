import {boolean} from "./boolean.js"
import {bezierEasing} from "./bezierEasing.js"
import { noise } from "./noise.js";

function expandMacros(programs, name){
  let out = [];
  for (let i = 0; i < programs[name].length; i++){
    let {type, value} = programs[name][i];
    if (type == "macro"){
      let o = expandMacros(programs,value);
      o.forEach(x=>out.push(x));
    }else{
      out.push(programs[name][i])
    }
  }
  return out;
}

let funcMap = {
  'union':(f,g)=>(t)=>{
    let a = f(t)
    let b = g(t)
    return boolean(a,b,'union');
  },
  'difference':(f,g)=>(t)=>{
    let a = f(t)
    let b = g(t)
    return boolean(a,b,'difference');
  },
  'intersection':(f,g)=>(t)=>{
    let a = f(t)
    let b = g(t)
    return boolean(a,b,'intersection');
  },
  'translateX':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        a[i][j][0] += b;
      }
    }
    return a;
  },
  'translateY':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        a[i][j][1] += b;
      }
    }
    return a;
  },
  'scale': (f, g) => t => {
    let a = f(t);
    let b = g(t);
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        a[i][j][0] *= b;
        a[i][j][1] *= b;
      }
    }
    return a;
  },
  'scaleX':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        a[i][j][0] *= b;
      }
    }
    return a;
  },
  'scaleY':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        a[i][j][1] *= b;
      }
    }
    return a;
  },
  'rotate':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    let costh = Math.cos(b);
    let sinth = Math.sin(b);
    for (let i = 0; i < a.length; i++){
      for (let j = 0; j < a[i].length; j++){
        let [x0,y0] = a[i][j];
        let x = x0* costh-y0*sinth;
        let y = x0* sinth+y0*costh;
        a[i][j][0] = x;
        a[i][j][1] = y;
      }
    }
    return a;
  },
  'multiply':(f,g)=>(t)=>{
    return f(t)*g(t);
  },
  'composite':(f,g)=>(t)=>{
    return f(g(t));
  },
  'plus':(f,g)=>(t)=>{
    return f(t)+g(t);
  },
  'smooth':(f,g)=>(t)=>{
    let a = f(t);
    let b = g(t);
    let o = a.map(p=>getSmoothed(getResampledBySpacing(p,0.01),Math.round(b*100)));
    return o;
  },
  'warp':(f,g,h,q)=>(t)=>{
    let a = f(t);
    let b = g(t);
    for (let i = 0; i < a.length; i++){
      let n = a[i].length;
      for (let j = 0; j < n; j++){
        let [x0,y0] = a[i][(j-1+n)%n];
        let [x1,y1] = a[i][j];
        let [x2,y2] = a[i][(j+1)%n];
        let dx = x2-x0;
        let dy = y2-y0;
        let ex = -dy;
        let ey = dx;
        let l = Math.hypot(ex,ey);
        ex/=l;
        ey/=l;
        let m = b;
        if (q == '+'){
          m += h(j/n);
        }else{
          m *= h(j/n);
        }
        ex *= m;
        ey *= m;
        
        a[i][j][0] = x1+ex;
        a[i][j][1] = y1+ey;
      }
    }
    return a;
  }
}


export function runProgram({ programs }) {

  let prgm = expandMacros(programs,"main");

  let stack = [];

  for (let i = 0; i < prgm.length; i++){
    let {opera,type} = prgm[i];
    if (type == 'code'){
      console.log(prgm[i].value,eval(prgm[i].value))
      stack.push(eval(prgm[i].value));
    }else if (opera == 'nd'){
      if (type == 'shape'){
        let o = [];
        for (let j = 0; j <= prgm[i].sides; j++){
          let a = j/prgm[i].sides * Math.PI*2;
          let x = Math.cos(a);
          let y = Math.sin(a);
          o.push([x,y]);
        }
        stack.push(t=>[JSON.parse(JSON.stringify(o))]);
      }else if (type == 'number'){
        let n = Number(prgm[i].value);
        stack.push(t=>n);
      }else if (type == 'sine'){
        stack.push(function(t){
          let {frequency,phase,amplitude,shift} = prgm[i];
          // console.log({frequency,phase,amplitude,shift},t)
          // console.log(Math.sin((t+phase) / frequency * Math.PI * 2)*amplitude + shift)
          return Math.sin((t+phase) * frequency * Math.PI * 2)*amplitude + shift;
        });
      }else if (type == 'bezier'){
        let {start,end,handle0,handle1, scale} = prgm[i];
        
        stack.push(function(t){
          const val = bezierEasing(start,handle0,handle1,end)(t);
          return val*scale;
        });
      }else if (type == 'noise'){
        let {frequency,phase,amplitude,shift} = prgm[i];
        stack.push(function(t){
          return noise((t+phase) * frequency )*amplitude + shift;
        })
      }else if (type == 'thresh'){
        let {thresh,left,right} = prgm[i];
        stack.push(function(t){
          return t < thresh ? left : right;
        })
      }
    }else if (opera == 'tor'){
      if (type == 'warp'){
        let a = stack.pop();
        let b = stack.pop();
        let c = stack.pop();
        stack.push(funcMap[type](c,b,a))
      }else{
        let a = stack.pop();
        let b = stack.pop();
        stack.push(funcMap[type](b,a))
      }
    }
  }
  let fun = stack.pop();

  // let svg = visSvg(fun);
  // let div = document.createElement('div');
  // div.style="background:white;width:512px;height:512px;position:absolute;left:0px;top:0px;z-index:1000"
  // div.innerHTML = svg;
  // document.body.appendChild(div)

  return fun;
}


function visSvg(fun){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">`;
  
  for (let i = 0; i < 50; i++){
    let ps = fun(i/50);
    console.log(JSON.stringify(ps));
    for (let j = 0; j < ps.length; j++){
      o += `<path d="M`;
      for (let k = 0; k < ps[j].length; k++){
        let [x,y] = ps[j][k];
        o += `${x*100+256},${y*100+i*10} `
      }
      o += `z" stroke="black" fill="none"/>`
    }
  }
  return o;
}



function getSmoothed(poly,smoothingSize,smoothingShape=0){
  function clamp(a,b,c){
    return Math.min(Math.max(a,b),c);
  }
  function map(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
  }
  // https://github.com/openframeworks/openFrameworks/blob/c21aba181f5180a8f4c2e0bcbde541a643abecec/libs/openFrameworks/graphics/ofPolyline.inl#L470
  let n = poly.length;
  smoothingSize = clamp(smoothingSize, 0, n);
  smoothingShape = clamp(smoothingShape, 0, 1);
  
  // precompute weights and normalization
  let weights = new Array(smoothingSize);
  // side weights
  for(let i = 1; i < smoothingSize; i++) {
    let curWeight = map(i, 0, smoothingSize, 1, smoothingShape);
    weights[i] = curWeight;
  }
  // make a copy of this polyline
  let result = poly.map(xy=>[...xy]);
  let bClosed = true;
  for(let i = 0; i < n; i++) {
    let sum = 1; // center weight
    for(let j = 1; j < smoothingSize; j++) {
      let curx = 0;
      let cury = 0;
      let leftPosition = i - j;
      let rightPosition = i + j;
      if(leftPosition < 0 && bClosed) {
        leftPosition += n;
      }
      if(leftPosition >= 0) {
        curx += poly[leftPosition][0];
        cury += poly[leftPosition][1];
        sum += weights[j];
      }
      if(rightPosition >= n && bClosed) {
        rightPosition -= n;
      }
      if(rightPosition < n) {
        curx += poly[rightPosition][0];
        cury += poly[rightPosition][1];
        sum += weights[j];
      }
      result[i][0] += curx * weights[j];
      result[i][1] += cury * weights[j];
    }
    result[i][0] /= sum;
    result[i][1] /= sum;
  }
  
  return result;
}

function getResampledBySpacing(poly0,spacing) {
  if(spacing==0 || poly0.length == 0) return poly0;
  let poly = [];
  let acc_len = [0];
  let tot_len = 0;
  for (let i = 0; i < poly0.length-1; i++){
    let [x0,y0] = poly0[i];
    let [x1,y1] = poly0[i+1];
    tot_len += Math.hypot(x1-x0,y1-y0);
    acc_len.push(tot_len);
  }
  function getPointAtLength(l){
    for (let i = poly0.length-1; i >= 0; i--){
      if (acc_len[i] <= l){
        let t = (l - acc_len[i])/(acc_len[i+1] - acc_len[i]);
        return [
          poly0[i][0] * (1-t) + poly0[i+1][0] * t,
          poly0[i][1] * (1-t) + poly0[i+1][1] * t,
        ];
      }
    }
    return [0,0];
  }

  for (let f = 0; f < tot_len; f += spacing){
    poly.push(getPointAtLength(f));
  }
  if(poly.length) poly.push(poly0[poly0.length-1]);
  return poly;
}



