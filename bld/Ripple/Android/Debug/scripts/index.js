/// <reference path="bleio.ts" />
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var CLICK = 'click';
var CHANGE = 'change';
var bleio;
(function (bleio) {
    "use strict";
    var BleTI = (function () {
        function BleTI() {
            var _this = this;
            this.deviceViews = [];
            var scan = new bleio.ScannerView();
            scan.onFound = function (device) { return _this.onDeviceFound(device); };
            document.addEventListener('pause', function () { return _this.onPause(); }, false);
            document.addEventListener('resume', function () { return _this.onResume(); }, false);
        }
        BleTI.prototype.onDeviceFound = function (device) {
            this.deviceViews.push(new bleio.DeviceView(device, $('<div>').appendTo($('#deviceView'))));
        };
        BleTI.prototype.onPause = function () {
            // TODO: This application has been suspended. Save application state here.
        };
        BleTI.prototype.onResume = function () {
            // TODO: This application has been reactivated. Restore application state here.
        };
        return BleTI;
    })();
    bleio.BleTI = BleTI;
})(bleio || (bleio = {}));
//# sourceMappingURL=index.js.map