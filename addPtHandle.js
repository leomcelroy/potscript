import { createListener } from "./createListener.js"
import { elsAtLoc } from "./elsAtLoc.js";

export function addPtHandle(state) {
  const listener = createListener(document.body);

  // create a reference to the currently dragged element
  let draggedElement = null;
  let svg = null;

  listener("touchstart", ".pt-handle", e => {
    e.preventDefault();
  }, { passive: false })

  listener("pointerdown", ".pt-handle", e => {
    const els = elsAtLoc(e.clientX, e.clientY, ".pt-handle");
    if (els.length === 0) return;
    draggedElement = els[0];
    // draggedElement.setAttribute('pointer-events', 'none');
    svg = draggedElement.ownerSVGElement;
  })

  listener("pointermove", "", e => {

    if (draggedElement && svg) {
      let pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      // Transform the point from screen coordinates to SVG coordinates
      let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      let x = svgP.x;
      let y = svgP.y;

      x = Math.max(x, -1);
      x = Math.min(x, 1);
      y = Math.max(y, -1);
      y = Math.min(y, 1);

      const { value } = draggedElement.value;

      value.value[0] = x;
      value.value[1] = y;
      

    }
  })

  listener("pointerup", "", e => {
    if (draggedElement) {
      draggedElement.setAttribute('pointer-events', 'all');
      draggedElement = null;
      svg = null;
      
    }
  })
}