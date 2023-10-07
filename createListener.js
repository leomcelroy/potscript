
// this triggers if you click el inside target element
// perhaps that should be configurable

// function getTrigger(e, selectorString) {
//   if (selectorString === "") return e.target;

//   const triggerEl = e.target.closest(selectorString);

//   if (triggerEl && triggerEl.contains(e.target)) return triggerEl;
//   else if (e.target.matches(selectorString)) return e.target;
//   else return null;
// }

// function matchesTrigger(e, selectorString) {
//   const triggerEl = e.target.closest(selectorString);
  
//   return e.target.matches(selectorString) 
//     || (triggerEl && triggerEl.contains(e.target)); 
// }

// // create on listener
// export function createListener(target) {
//   return (eventName, selectorString, event) => {
//     // focus doesn't work with this, focus doesn't bubble, need focusin
//     target.addEventListener(eventName, (e) => {
//       if (selectorString === "" || matchesTrigger(e, selectorString)) event(e, getTrigger(e, selectorString));
//     });
//   };
// }



function trigger(e) {
  return e.composedPath()[0];
}

function matchesTrigger(e, selectorString) {
  return trigger(e).matches(selectorString);
}

// create on listener
export function createListener(target) {
  return (eventName, selectorString, event, ops = {}) => {
    // focus doesn't work with this, focus doesn't bubble, need focusin
    target.addEventListener(eventName, (e) => {
      e.trigger = trigger(e); // Do I need this? e.target seems to work in many (all?) cases
      if (selectorString === "" || matchesTrigger(e, selectorString)) event(e);
    }, ops);
  };
}