'use strict';

function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

// Your JavaScript for larger screens
function handleMinWidthChange(e) {
    if (e.matches) {
        console.log('Viewport is 768px or wider');
        
        // Select the toolbar by its ID or class
        const toolbar = document.querySelector('#toolbar'); // Replace '#toolbar' with your toolbar's selector

        // Find the first child div of the toolbar
        const firstChildDiv = toolbar.querySelector('div:first-child');
        // Check if the first child div has the class 'btn-group'
        if (firstChildDiv.classList.contains('btn-group')) {
            // Remove the 'btn-group' class
            firstChildDiv.classList.remove('btn-group');
            // Add the 'btn-group-vertical' class
            firstChildDiv.classList.add('btn-group-vertical');
        }

        const elementsWithDataBsPlacement = toolbar.querySelectorAll('[data-bs-placement]');
        // Iterate over these elements and update the 'data-bs-placement' attribute
        elementsWithDataBsPlacement.forEach((item, indx) => {                
            if ((indx + 1) % 2 === 0) {
                item.setAttribute('data-bs-placement', 'left');
            } else {
                item.setAttribute('data-bs-placement', 'right');
            }
        });
        initializeTooltips();
    }
}

// Your JavaScript for smaller screens
function handleMaxWidthChange(e) {
    if (e.matches) {
        console.log('Viewport is 767px or narrower');
        
        // Select the toolbar by its ID or class
        const toolbar = document.querySelector('#toolbar'); // Replace '#toolbar' with your toolbar's selector

        const firstChildDiv = toolbar.querySelector('div:first-child');

        // Check if the first child div has the class 'btn-group'
        if (firstChildDiv.classList.contains('btn-group-vertical')) {
            // Remove the 'btn-group' class
            firstChildDiv.classList.add('btn-group');
            // Add the 'btn-group-vertical' class
            firstChildDiv.classList.remove('btn-group-vertical');
        }

        const elementsWithDataBsPlacement = toolbar.querySelectorAll('[data-bs-placement]');
        // Iterate over these elements and update the 'data-bs-placement' attribute
        elementsWithDataBsPlacement.forEach((item, indx) => {             
            item.setAttribute('data-bs-placement', 'bottom');
        });
        initializeTooltips();
    }
}

function initialJSONInput(){
    var input = {
        colors: [
            {color: "A", hex: "741D35" },
            {color: "B", hex: "473CC6" },
            {color: "C", hex: "EA8521" },
            {color: "D", hex: "5CA6E4" },
            {color: "E", hex: "C52B23" },
            {color: "F", hex: "784C1A" },
            {color: "G", hex: "E95E7A" },
            {color: "H", hex: "2AC965" },
            {color: "I", hex: "A10579" },
            {color: "J", hex: "0F571B" },
            {color: "K", hex: "8730CF" },
            {color: "L", hex: "8730CF" },
            {color: "Z", hex: "000000" }
        ],
        tubes: [
            {tube: "1", colors: [ "", "", "", "" ], row: 0, column: 0 },
            {tube: "2", colors: [ "", "", "", "Z" ], row: 0, column: 1  },
            {tube: "3", colors: [ "", "", "", "Z" ], row: 0, column: 2  },
            {tube: "4", colors: [ "", "", "", "" ], row: 0, column: 3  },
            {tube: "5", colors: [ "", "", "Z", "Z" ], row: 0, column: 4  },
            {tube: "6", colors: [ "", "", "", "" ], row: 0, column: 5  },
            {tube: "7", colors: [ "", "", "Z", "Z" ], row: 1, column: 0  },
            {tube: "8", colors: [ "", "", "Z", "Z" ], row: 1, column: 1  },
            {tube: "9", colors: [ "", "", "", "" ], row: 1, column: 2  },
            {tube: "10", colors: [ "", "", "", "Z" ], row: 1, column: 3  },
            {tube: "11", colors: [ "", "", "Z", "Z" ], row: 1, column: 4  },
            {tube: "12", colors: [ "", "", "", "Z" ], row: 1, column: 5  },
            {tube: "13", colors: [ "", "", "", "" ], row: 2, column: 0  },
            {tube: "14", colors: [ "", "", "", "" ], row: 2, column: 1  }
        ]
    };
    document.getElementById('textareaInput').value = JSON.stringify(input);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();

    document.getElementById('themeToggle').addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.setAttribute('data-bs-theme', 'light');
        }
    });

    const minWidthQuery = window.matchMedia('(min-width: 768px)');
    const maxWidthQuery = window.matchMedia('(max-width: 767px)');

    // Attach listeners to the MediaQueryList objects
    minWidthQuery.addListener(handleMinWidthChange);
    maxWidthQuery.addListener(handleMaxWidthChange);

    // Initial check
    handleMinWidthChange(minWidthQuery);
    handleMaxWidthChange(maxWidthQuery);

    var Cropper = window.Cropper;
    var URL = window.URL || window.webkitURL;
    var container = document.querySelector('.img-container');
    var image = container.getElementsByTagName('img').item(0);
    var options = {
        viewMode: 2,
        guides: false,
        background: false,
        movable: false,
        rotatable: false,
        scalable: false,
        zoomable: false,
        zoomOnTouch: false,
        zoomOnWheel: false,
        toggleDragModeOnDblclick: false,

        ready: function (e) {
          console.log(e.type);
        },
        crop: function (e) {   
          console.log(e.type);
          console.log(e.detail);

        }
      };
      var cropper = new Cropper(image, options);
      var originalImageURL = image.src;
      var uploadedImageType = 'image/png';
      var uploadedImageName = 'sample-screenshot';
      var uploadedImageURL; 

      // Import image
    var inputImage = document.getElementById('PuzzleSetupUpload');
      if (URL) {
        inputImage.onchange = function () {
            var files = this.files;
            if (files && files.length) {
                var file = files[0];
                if (/^image\/\w+/.test(file.type)) {
                    uploadedImageType = file.type;
                    uploadedImageName = file.name;
            
                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                    }
            
                    image.src = uploadedImageURL = URL.createObjectURL(file);
            
                    if (cropper) {
                        cropper.destroy();
                    }
            
                    cropper = new Cropper(image, options);
                    inputImage.value = null;
                } else {
                    window.alert('Please choose an image file.');
                }
            }
        }
    } else {
        inputImage.disabled = true;
        inputImage.parentNode.className += ' disabled';
    }

    initialJSONInput();
});