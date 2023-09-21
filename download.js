export function download(filename, type, txt) {
  const blob = new Blob([txt], { type: `text/${type}` });

  var link = document.createElement("a"); // Or maybe get it from the current document
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.${type}`;
  link.click();
  URL.revokeObjectURL(link);
}