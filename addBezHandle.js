import { createListener } from "./createListener.js"
import { elsAtLoc } from "./elsAtLoc.js";

export function addBezHandle(state) {
  const listener = createListener(document.body);

  // create a reference to the currently dragged element
  let draggedElement = null;
  let svg = null;

  listener("touchstart", ".bez-handle", e => {
    e.preventDefault();
  }, { passive: false })

  listener("pointerdown", ".bez-handle", (e) => {
    const els = elsAtLoc(e.clientX, e.clientY, ".bez-handle");

    if (els.length === 0) return;

    draggedElement = els[0];

    draggedElement.setAttribute('pointer-events', 'none');
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

      x = Math.max(x, 0);
      x = Math.min(x, 1);
      y = Math.max(y, -1);
      y = Math.min(y, 1);

      const { idx, value } = draggedElement.value;

      if (idx === "start" || idx === "end") {
        value[idx] = y;
      } else {
        value[idx][0] = x;
        value[idx][1] = y;
      }

      evalProgram();

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