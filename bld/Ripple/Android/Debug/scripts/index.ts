/// <reference path="bleio.ts" />
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var CLICK = 'click';
var CHANGE = 'change';	
module bleio {
    "use strict";

    export class BleTI {
        private scannerView:bleio.ScannerView
        private deviceViews:bleio.DeviceView[]=[];
        constructor() {
            var scan: bleio.ScannerView = new bleio.ScannerView();
            scan.onFound = (device: bleio.BleDevice) => this.onDeviceFound(device); 

           document.addEventListener('pause',() => this.onPause(), false);
           document.addEventListener('resume',() => this.onResume(), false);
        }  

        private onDeviceFound(device: bleio.BleDevice): void {
            this.deviceViews.push(new bleio.DeviceView(device,$('<div>').appendTo($('#deviceView'))));
        }
       

       onPause() {
            // TODO: This application has been suspended. Save application state here.
        }

       onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }

    }   
}
