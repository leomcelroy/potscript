export function addUpload(dropZone, state) {

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      dropZone.style.backgroundColor = 'purple';
    }

    function unhighlight(e) {
      dropZone.style.backgroundColor = 'initial';
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      var dt = e.dataTransfer;
      var file = dt.files[0];

      var reader = new FileReader();
      reader.onload = function(event) {
        var contents = event.target.result;
        try {
          var json = JSON.parse(contents);
          state.programs = json;
        } catch(err) {
          console.error("Error in parsing JSON: ", err);
        }
      };
      reader.readAsText(file);
    }
}