
import { createListener } from "./createListener.js"

const listenerObject = {
    handleEvent(event) {
        event.preventDefault();
    }
};

export function addProgramEditting(state) {
  const listener = createListener(document.body);

  let removed = false;
  let fromToolbox = false;
  let dragged = false;

  listener("pointerdown", ".box", (e) => {
    const trigger = e.target;
    const index = Number(trigger.dataset.index);
    const data = state.boxes[index];
    const shiftX = e.clientX - trigger.getBoundingClientRect().left;
    const shiftY = e.clientY - trigger.getBoundingClientRect().top;

    state.dragId = {
      name: "",
      index,
      data,
      shiftX,
      shiftY
    };

    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;

    console.log(state.dragId);

    fromToolbox = true;

    window.addEventListener("touchmove", listenerObject, {passive: false});
  })

  listener("pointerdown", ".macro-name", (e) => {
    const trigger = e.target;
    if (e.target.data === "main") return;

    const data = {
      data: {type: 'macro', value: e.target.data },
      index: 0,
      name: "",
      shiftX: 0,
      shiftY: 0,
      color: [0,0]
    }

    state.dragId = data;

    data.shiftX = e.clientX - trigger.getBoundingClientRect().left;
    data.shiftY = e.clientY - trigger.getBoundingClientRect().top;

    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;

    fromToolbox = true;

    window.addEventListener("touchmove", listenerObject, {passive: false});
  })

  listener("pointerdown", ".draggable-box", (e) => {
    const trigger = e.target;
    const index = Number(trigger.dataset.index);
    const name = trigger.dataset.programName;
    const data = state.programs[name][index];
    const shiftX = e.clientX - trigger.getBoundingClientRect().left;
    const shiftY = e.clientY - trigger.getBoundingClientRect().top;

    state.dragId = {
      name,
      index,
      data,
      shiftX,
      shiftY
    };

    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;

    window.addEventListener("touchmove", listenerObject, {passive: false});
  });

  listener("pointermove", "", e => {
    if (removed) return;
    if (fromToolbox) return;
    if (state.dragId === null) return;

    const { name, index } = state.dragId;

    const targetArr = state.programs[name];
    targetArr.splice(index, 1);

    if (state.programs[name].length === 0 && name !== "main") delete state.programs[name];

    removed = true;
    dragged = true;
    window.addEventListener("touchmove", listenerObject, {passive: false});
  })

  listener("pointerup", "", e => {

    if (!removed && !fromToolbox) return;
    if (state.dragId === null) return;

    const els = elsAtLoc(e.clientX, e.clientY, ".draggable-box, .program-spacer-start, .program-spacer-end");

    if (els.length === 0) return;

    const el = els[0];

    const hoverId = {
      name: el.dataset.programName,
      index: Number(el.dataset.index)
    }

    const targetArr = state.programs[hoverId.name];

    insertAtIndex(targetArr, JSON.parse(JSON.stringify(state.dragId.data)), Number(el.dataset.index));
    
  })

  listener("pointerup", "", (e) => {
    if (dragged || fromToolbox) return;

    // if (!e.target.matches(".draggable-box")) return;

    const els = elsAtLoc(e.clientX, e.clientY, ".draggable-box");
    if (els.length !== 1) return;
    const [ box ] = els;
    console.log(e.target);
    // const box = e.target;
    const { programName, index} = box.dataset;

    const value = state.programs[programName][index];

    state.editor = value;
  })

  listener("pointerup", "", e => {
    window.removeEventListener("touchmove", listenerObject, {passive: false});
    removed = false;
    fromToolbox = false;
    dragged = false;
    state.dragId = null;
  })
}

function elsAtLoc(x, y, selector) {
  const matchedElements = [];
  const elements = document.querySelectorAll(selector);

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      matchedElements.push(element);
    }
  }

  return matchedElements;
}

function insertAtIndex(array, value, index) {
  // Check if index is valid
  if (index < 0 || index > array.length) {
    console.error("Invalid index");
    return;
  }

  array.splice(index, 0, value);
}


function moveArrayElement(arr, sourceIndex, targetIndex) {
  // Check if sourceIndex and targetIndex are valid
  if (sourceIndex < 0 || sourceIndex >= arr.length || targetIndex < 0 || targetIndex >= arr.length) {
    console.error("Invalid sourceIndex or targetIndex");
    return;
  }

  // Remove the element from sourceIndex
  const element = arr.splice(sourceIndex, 1)[0];

  // Insert it back to the array at targetIndex
  arr.splice(targetIndex, 0, element);
}