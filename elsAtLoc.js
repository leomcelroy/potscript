export function elsAtLoc(x, y, selector) {
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