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
               // console.log(device);   
                    var dev: BleDevice = new BleDevice(device.address, device.rssi, device.name);
                    this.knownDevices[device.address] = dev;
                    this.status.text('Found ' + device.name);
                    this.device = dev;
                    this.deviceView = null;
                    this.stopScan();                    
                    this.onFound(dev);        
                
            }
           
        }      
     
        stopScan(): void {
            this.status.text('Scan');
            this.btnScanner.data('state', 'scan');
            this.btnScanner.text('Scan');
            this.scanner.stopScan(() => { });           
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
                    this.scanner.startScan((device) => this.onDeviceFound(device));
                    break;
                case 'scanning':
                    this.stopScan();
                    break;              

            }


        }
    }


   
    export class DeviceView {
        private title: JQuery;
        private status: JQuery;
       
        private scan: JQuery;    
        private btnConnect: JQuery;     
        
        private services: bleio.BleService[];
        private library: LibraryGages;        
        private list: JQuery;

        getDevice(): bleio.BleDevice {
            return this.device;

        }
        constructor(private device: bleio.BleDevice, private view:JQuery) {
            this.title = $('<h1>').text(device.address).appendTo(view);
            this.status = $('<h3>').text('found').appendTo(view);
            this.btnConnect = $('<a>').data('state', 'connect').addClass('btn').text('Connect').on(CLICK,(evt) => this.onConnectClick(evt)).appendTo(view);          
            this.library = new LibraryGages();            
            this.list = $('<ul>').appendTo(view);
            this.list.on(CLICK, 'a.header',(evt) => this.toggleActive(evt));
            
        }
        private onReconnected(): void {
           // console.log('reconnected ', res); 
            this.populateServices();          
        }

        private onConnectClick(evt: JQueryEventObject): void {
            var el = $(evt.currentTarget);
            if (!this.device) return;
            switch (el.data('state')) {
                case 'connect':
                    if (this.device.getAllServices()) this.reconnect();
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
     
       
        private toggleActive(evt): void{
            var el: JQuery = $(evt.target);
            if (el.data('type') !== 'service') return;
            var name: string = el.data('name');  
            
            if (!this.views[name]) this.views[name] = this.library.createView(this.device.getServiceByName(name), el);           
            this.views[name].toggle();            
        }

        private views: any = {};
        reconnect() {
            this.device.reconnect(() => this.onReconnected());
        }
        
        disconnect() {
            this.device.disconnect(); 

        }
      
       
        populateServices(): void {
            this.status.text('Connected');
            this.views = {}
            var view = this.view 
            this.title.text(this.device.name);
            view.addClass('services');
            var servs: bleio.BleService[] = this.device.getAllServices();          
            this.services = servs;           
            var out = '';
            for (var i = 0, n = servs.length; i < n; i++) out += this.renderSevice(i, servs[i]);
            this.list.html(out);
           

        }
        renderSevice(id: number, ser: bleio.BleService): string {
            return '<li class="service"><a class="header" data-type="service" data-uuid="' + ser.uuid + '"  data-id="' + id + '" data-name="' + ser.name + '">' + ser.name + '</a></li>';
        }

     

    }

}