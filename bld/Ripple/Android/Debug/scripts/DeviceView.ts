/// <reference path="typings/jquery.d.ts" />
/// <reference path="tisensortag.ts" />
/// <reference path="easyble.ts" />
module ti {
    declare var CLICK: string

    export class ScannerView {
      
        private status: JQuery;       
        private btnScanner: JQuery;
        private scanner: evoble.BleScanner
        private deviceView: DeviceView
        private myDevice: evoble.BleDevice;
        constructor() {
         
            this.status = $('#status');           
            this.btnScanner = $('#scan').data('state', 'scan').on(CLICK,(evt) => this.onScanClick(evt));
            this.scanner = new evoble.BleScanner()
        }


        private onFoundDevice(device: evoble.BleDevice): void {    
            this.myDevice = device;            
            this.status.text('Found ' + device.name);
            this.btnScanner.data('state', 'connect');
            this.btnScanner.text('Connect');
            this.scanner.stopScan();
        }

        private onConnected(name:string): void {           
            this.status.text('Connected');
            this.btnScanner.data('state', 'connected');
            this.btnScanner.text('Disconnect');
            this.deviceView.populateServices($('<div>').appendTo($('#deviceView')));

        }
        private onDeviceFound(device: evoble.BleDevice): void {
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
                    this.scanner.reportDeviceOnce(true);
                    this.scanner.scanTime(2000);
                    this.scanner.startScan((device) => this.onDeviceFound(device));
                    break;
                case 'scanning':
                    this.status.text('Stoped Scan');                   
                    this.btnScanner.data('state', 'scan');
                    this.btnScanner.text('Scan');
                    this.scanner.stopScan();
                    break;

                case 'connect':
                    this.status.text('Connecting');
                    this.btnScanner.data('state', 'connecting');
                    this.btnScanner.text('Disconnect');
                    if (!this.deviceView) this.deviceView = new DeviceView(this.myDevice,(name:string)=>this.onConnected(name));
                    else this.deviceView.reconnect();             
                    break;
                case 'disconnect':
                    this.status.text('Disconnected');
                    this.btnScanner.data('state', 'connect');
                    this.btnScanner.text('Re-connect');
                    if (this.deviceView) this.deviceView.disconnect();                                      
                    break;
                case 'connected':
                    this.status.text('Disconnecting');
                    this.btnScanner.data('state', 'connect');
                    this.btnScanner.text('Re-connect');
                    if (this.deviceView) this.deviceView.disconnect();
                    break;

            }


        }
    }


   
    export class DeviceView {
        private title: JQuery;
        private status: JQuery;
       
        private scan: JQuery;
        private save: JQuery;
       
        
       
        // private device: evoble.BleDevice;
        private services: evoble.BleService[];
        private library: LibraryGages;
        
        view: JQuery

        constructor(private device: evoble.BleDevice, private onConnected: Function) {
            this.title = $('#title');           
            this.library = new LibraryGages();            
            this.save = $('#save');
            this.device.discover(this.library.CONST,()=>this.onDiscovered());
        }
        private onDiscovered(): void {
            this.onConnected && this.onConnected(this.device.name);
        }
        private activateService(id: number): void {
            if (isNaN(id)) return
            var serv: evoble.BleService = this.services[id];

        }
        private deactivateService(id: number): void {
            if (isNaN(id)) return
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
            
        }
        disconnect() {
            this.device.disconnect(); 

        }
      

        populateServices(view: JQuery): void { 
            this.title.text(this.device.name);
            view.addClass('services');
            var servs: evoble.BleService[] = this.device.getAllServices();
            this.services = servs;           
            var out = '<ul>';
            for (var i = 0, n = servs.length; i < n; i++) out += this.renderSevice(i, servs[i]);
            view.html(out + '</ul>');
            view.on(CLICK, 'a.header',(evt) => this.toggleActive(evt));
            this.view = view;


        }
        renderSevice(id: number, ser: evoble.BleService): string {
            return '<li class="service"><a class="header" href="#" data-type="service" data-uuid="' + ser.uuid + '"  data-id="' + id + '" data-name="' + ser.name + '">' + ser.name + '</a></li>';
        }

        private onBarometer(res): void {
            console.log('onBarometer ' + res);
        }

       

       



    

        private onSaveClick(evt: JQueryEventObject): void {

        }
        private onLinkClick(evt: JQueryEventObject): void {

        }

    }

}