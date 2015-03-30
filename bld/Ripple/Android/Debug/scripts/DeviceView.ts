/// <reference path="typings/jquery.d.ts" />
/// <reference path="tisensortag.ts" />
/// <reference path="bleio.ts" />
module bleio {
    declare var CLICK: string

    export class ScannerView {
      
        private status: JQuery;       
        private btnScanner: JQuery;
        private btnConnect: JQuery;
        private scanner: bleio.BleScanner
        private deviceView: DeviceView       
        private device: bleio.BleDevice;
        private knownDevices: any;
        onFound: Function;
       
        constructor() {         
            this.status = $('#status');           
            this.btnScanner = $('#scan').data('state', 'scan').on(CLICK,(evt) => this.onScanClick(evt));
           
            this.scanner = new bleio.BleScanner()
            this.clear();
        }

        clear() {
            this.knownDevices = {};
        }
      
       
        private onFoundDevice(device: bleio.BleDevice): void {    
            var existingDevice: BleDevice = this.knownDevices[device.address]
            if (existingDevice) {
                existingDevice.rssi = device.rssi;    
                     
            } else {
                if (device && device.name) {
                    var dev: BleDevice = new BleDevice(device.address, device.rssi, device.name);
                    this.knownDevices[device.address] = dev;
                    this.status.text('Found ' + device.name);
                    this.device = dev;
                    this.deviceView = null;
                    this.scanner.stopScan();
                    this.onFound(dev);

                }
                
            }
           
        }      
     
       
        private onDeviceFound(device: bleio.BleDevice): void {
            if ((device != null) && (device.name != null)) this.onFoundDevice(device);
        }
        private onScanClick(evt: JQueryEventObject): void {
            var el = $(evt.currentTarget);
            
            switch (el.data('state')) {
                case 'scan':
                    el.data('state', 'scanning');
                    this.status.text('Scanning...');
                    this.btnScanner.text('Stop Scan');
                    this.scanner.stopScan();                                
                    this.scanner.startScan((device) => this.onDeviceFound(device));
                    break;
                case 'scanning':
                    this.status.text('Scan');                   
                    this.btnScanner.data('state', 'scan');
                    this.btnScanner.text('Scan');
                    this.scanner.stopScan();
                    break;              

            }


        }
    }


   
    export class DeviceView {
        private title: JQuery;
        private status: JQuery;
       
        private scan: JQuery;
     ///   private save: JQuery;
       
        private btnConnect: JQuery;
       
        // private device: evoble.BleDevice;
        private services: bleio.BleService[];
        private library: LibraryGages;        
       

        getDevice(): bleio.BleDevice {
            return this.device;

        }
        constructor(private device: bleio.BleDevice, private view:JQuery) {
            this.title = $('<h2>').text(device.address).appendTo(view);
            this.status = $('<h3>').text('found').appendTo(view);
            this.btnConnect = $('<a>').data('state', 'connect').on(CLICK,(evt) => this.onConnectClick(evt)).appendTo(view);          
            this.library = new LibraryGages();            
           // this.save = $('#save');
            
        }
        private onConnectClick(evt: JQueryEventObject): void {
            var el = $(evt.currentTarget);
            if (!this.device) return;
            switch (el.data('state')) {
                case 'connect':
                    if (this.device) this.device.reconnect();
                    else this.device.discover(this.library.CONST,() => this.populateServices());
                    this.status.text('connecting...');
                    this.btnConnect.data('state', 'disconnect');
                    this.btnConnect.text('Disconnect');
                    break;
                case 'disconnect':
                    this.status.text('Disconnected');
                    this.btnConnect.data('state', 'connect');
                    this.btnConnect.text('Re-connect');
                    if (this.device) this.device.disconnect();
                    break;
            }
        }
        
       // private activateService(id: number): void {
           // if (isNaN(id)) return
            //var serv: bleio.BleService = this.services[id];

       // }
       // private deactivateService(id: number): void {
          //  if (isNaN(id)) return
       // }

       
        private toggleActive(evt): void{
            var el: JQuery = $(evt.target);
            if (el.data('type') !== 'service') return;
            var name: string = el.data('name');  
           // console.log(name)    
            if (!this.views[name]) this.views[name] = this.library.createView(this.device.getServiceByName(name), el);           
            this.views[name].toggle();            
        }

        private views: any = {};
        reconnect() {
            
        }
        
        disconnect() {
            this.device.disconnect(); 

        }
      

        populateServices(): void {
            this.status.text('Connected');
            var view = this.view 
            this.title.text(this.device.name);
            view.addClass('services');
            var servs: bleio.BleService[] = this.device.getAllServices();
            this.services = servs;           
            var out = '<ul>';
            for (var i = 0, n = servs.length; i < n; i++) out += this.renderSevice(i, servs[i]);
            view.html(out + '</ul>');
            view.on(CLICK, 'a.header',(evt) => this.toggleActive(evt));

        }
        renderSevice(id: number, ser: bleio.BleService): string {
            return '<li class="service"><a class="header" href="#" data-type="service" data-uuid="' + ser.uuid + '"  data-id="' + id + '" data-name="' + ser.name + '">' + ser.name + '</a></li>';
        }

       // private onBarometer(res): void {
           // console.log('onBarometer ' + res);
       // }

       

       



    

        private onSaveClick(evt: JQueryEventObject): void {

        }
        private onLinkClick(evt: JQueryEventObject): void {

        }

    }

}