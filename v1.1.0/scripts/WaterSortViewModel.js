"use strict";

var WaterSortViewModel = function (config) {
    var self = this;

    self.Debugging = true;
    self.Solution = ko.observableArray([]);
    self.SolutionIndex = ko.observable(0);
    self.Defaults = JSON.parse(JSON.stringify(config)); 

    self.Colors = JSON.parse(JSON.stringify(self.Defaults.Colors));
    self.ColorCount = ko.pureComputed(function () {
        var result = "0"
        if (self.Colors) {
            return (self.Colors.length + 1);
        }
        return result;
    }, self);

    self.Tubes = JSON.parse(JSON.stringify(self.Defaults.Tubes));
    self.TubeCount = ko.pureComputed(function () {
        var result = "0"
        if (self.Tubes) {
            return (self.Tubes.length + 1);
        }
        return result;
    }, self);

    self.UnknownCount = ko.pureComputed(function () {
        var counter = 0;
        if (self.Tubes) {
            self.Tubes.forEach(tube => {
                tube.Bands.forEach(band => {
                    if (band == "Z")
                        counter++;
                });
            });
        }
        return counter;
    }, self);

    self.Canvas = null;
    self.InitializedCanvas = function () {
        const width = 422;
        const height = 666;
        const canvas = document.querySelector('#canvas');

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        const scale = window.devicePixelRatio;
        canvas.width = width * scale;
        canvas.height = height * scale;

        canvas.getContext('2d').scale(scale, scale);
        return canvas;
    };

    self.SolutionLabel = ko.pureComputed(function () {
        var result = ""
        if (self.Solution().length > 0) {
            return (self.SolutionIndex() + 1) + ' of ' + self.Solution().length;
        }
        return result;
    }, self);

    self.Solve = function () {
        const state = new GameState(self.Tubes().map(function (tube) {
            return tube.LetterColorCode().toUpperCase();
        }));
        const solution = state.Solve(state);

        if (solution.length === 0) {
            self.DisplaySnackbar("No solution found, please reconfigure water tubes.", "danger");
        } else {
            self.Solution(solution);
            self.SolutionIndex(0);
            self.DisplaySnackbar("Found a solution, please use Step and Back to review the solution.", "success");
        }
        self.OutputWindow("");
    };
    self.CanSolve = ko.pureComputed(function () {
        var result = true;
        for (let idx = 0; idx < self.Pallet().length; idx++) {

            if (self.Pallet()[idx].Counter() != 4 && self.Pallet()[idx].Counter() != 0) {
                result = false;
                break;
            }
        }
        return result;
    }, self);
    self.IsSolved = ko.pureComputed(function () {
        return (self.Solution().length > 0);
    }, self);
    self.SolvedLabel = ko.pureComputed(function () {
        return self.IsSolved() ? "Solved" : "Solve";
    }, self);

    self.Step = function () {
        var indx = self.SolutionIndex();
        var left = self.Solution()[self.SolutionIndex()];
        self.SolutionIndex(++indx);
        var right = self.Solution()[self.SolutionIndex()];
        self.GameDisplay.Draw(right);
        if (self.Debugging) {
            console.log(self.DiffGram(left, right));
        }
        self.WriteToOutputWindow(self.DiffGram(left, right), "step");
    };
    self.CanStep = ko.pureComputed(function () {
        return ((self.Solution().length - 1) > self.SolutionIndex());
    }, self);

    self.Back = function () {
        var indx = self.SolutionIndex();
        var left = self.Solution()[self.SolutionIndex()];
        self.SolutionIndex(--indx);
        var right = self.Solution()[self.SolutionIndex()];
        self.GameDisplay.Draw(right);
        if (self.Debugging) {
            console.log(self.DiffGram(left, right));
        }
        self.WriteToOutputWindow(self.DiffGram(left, right), "back");
    };
    self.CanBack = ko.pureComputed(function () {
        return (self.SolutionIndex() > 0 && self.Solution().length > 0);
    }, self);

    self.DisplaySnackbar = function (message, tag) {
        var animationTime = 3000;
        var bar = document.getElementById("snackbar");
        self.DisplayTag(tag)
        self.DisplayMessage(message);
        if (tag == "success") {
            self.DisplayTagLine("Sweet!");            
        } else {
            self.DisplayTagLine("Oh snap!");
        }
        $('#snackbar').fadeIn(500).delay(animationTime).fadeOut(500);
    };
    self.DisplayTag = ko.observable("");
    self.DisplayTagLine = ko.observable("");
    self.DisplayMessage = ko.observable("");
    self.ToastClasses = ko.pureComputed(function () {
        return (self.DisplayTag() == "success")
            ? "alert alert-success toast-bottom"
            : "alert alert-danger toast-bottom";
    }, self);

    self.WriteToOutputWindow = function (diff, action) {
        var left = diff.find((gram) => gram.action == "-").index + 1;
        var right = diff.find((gram) => gram.action == "+").index + 1;
        var color = self.Pallet().find((color) => color.Letter == diff.find((gram) => gram.action == "+").value.split('').pop()).HexColor();

        var message = self.OutputWindow();
        message += self.SolutionLabel() + "-> tube:" + left + " moved:" + ntc.name(color)[1] + " to tube:" + right;

        var messages = message.split('\n');
        if (messages.length > 4) {
            message = "";
            messages.forEach((msg, index) => {
                if (index > 0)
                    message += msg + '\n'
            });
            self.OutputWindow(message);
        } else {
            self.OutputWindow(message + '\n');
        }        
    };
    self.OutputWindow = ko.observable("");

    function IsEqual(left, right) {
        return JSON.stringify(left) === JSON.stringify(right);
    }

    // A function that returns a diff gram of two arrays
    self.DiffGram = function (left, right) {
        let result = [];
        // Loop through the first array
        for (let i = 0; i < left.length; i++) {
            // Compare each element with the second array
            if (!IsEqual(left[i], right[i])) {
                if (right[i].length > left[i].length) {
                    result.push({ action: "+", index: i, value: right[i] });
                } else {
                    result.push({ action: "-", index: i, value: right[i] });
                }
            }
        }
        return result;
    }

    self.UpdateOnChangeEvents();
    self.UpdateGameDisplay();
};