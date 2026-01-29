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
        Colors: [
            {Key: "A", Hexadecimal: "741D35", Opacity: 1 },
            {Key: "B", Hexadecimal: "473CC6", Opacity: 1 },
            {Key: "C", Hexadecimal: "EA8521", Opacity: 1 },
            {Key: "D", Hexadecimal: "5CA6E4", Opacity: 1 },
            {Key: "E", Hexadecimal: "C52B23", Opacity: 1 },
            {Key: "F", Hexadecimal: "784C1A", Opacity: 1 },
            {Key: "G", Hexadecimal: "E95E7A", Opacity: 1 },
            {Key: "H", Hexadecimal: "E09AE1", Opacity: 1 },
            {Key: "I", Hexadecimal: "A10579", Opacity: 1 },
            {Key: "J", Hexadecimal: "2AC865", Opacity: 1 },
            {Key: "K", Hexadecimal: "0F571B", Opacity: 1 },
            {Key: "L", Hexadecimal: "862FCD", Opacity: 1 },
            {Key: "Z", Hexadecimal: "FFFFFF", Opacity: 1 },
            {Key: "_", Hexadecimal: "000000", Opacity: 0 }
        ],
        Tubes: [
            {Tube:  "1", Bands: [ "A", "B", "C", "D" ], Row: 0, Column: 0 },
            {Tube:  "2", Bands: [ "E", "F", "B", "Z" ], Row: 0, Column: 1  },
            {Tube:  "3", Bands: [ "G", "C", "D", "Z" ], Row: 0, Column: 2  },
            {Tube:  "4", Bands: [ "J", "B", "J", "H" ], Row: 0, Column: 3  },
            {Tube:  "5", Bands: [ "I", "F", "Z", "Z" ], Row: 0, Column: 4  },
            {Tube:  "6", Bands: [ "A", "J", "H", "D" ], Row: 0, Column: 5  },
            {Tube:  "7", Bands: [ "G", "K", "Z", "Z" ], Row: 1, Column: 0  },
            {Tube:  "8", Bands: [ "E", "K", "Z", "Z" ], Row: 1, Column: 1  },
            {Tube:  "9", Bands: [ "J", "K", "F", "H" ], Row: 1, Column: 2  },
            {Tube: "10", Bands: [ "A", "L", "I", "Z" ], Row: 1, Column: 3  },
            {Tube: "11", Bands: [ "L", "F", "Z", "Z" ], Row: 1, Column: 4  },
            {Tube: "12", Bands: [ "G", "L", "E", "Z" ], Row: 1, Column: 5  },
            {Tube: "13", Bands: [ "_", "_", "_", "_" ], Row: 2, Column: 0  },
            {Tube: "14", Bands: [ "_", "_", "_", "_" ], Row: 2, Column: 1  }
        ]
    };
    document.getElementById('textareaInput').value = JSON.stringify(input);
}

var isLocked = false; // Tracks the lock state
var lockIcon = document.querySelector('.icon-lock');

function updateLockIcon(cropper) {
    if (isLocked) {
        var cropperBoxData = cropper.getCropBoxData();
        lockIcon.style.right = `calc(100% - ${cropperBoxData.left + cropperBoxData.width}px)`;
        lockIcon.style.bottom = `calc(100% - ${cropperBoxData.top + cropperBoxData.height}px)`;
        lockIcon.style.display = 'block';
    } else {
        lockIcon.style.display = 'none';
    }
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

    // Add event listener to the cropper container
    image.addEventListener('dblclick', function() {
        isLocked = !isLocked; // Toggle lock state
        if (isLocked) {
            cropper.disable(); // Disable cropper if locked
        } else {
            cropper.enable(); // Enable cropper if unlocked
        }
        updateLockIcon(cropper); // Update lock icon display
    });

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