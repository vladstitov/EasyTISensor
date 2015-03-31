/// <reference path="typings/evothingsble.d.ts" />
module bleio {
  
    export class BleDescriptor {
        name: string;
        uuid: string;
        handle: number;
       
        constructor(obj: any) {
            for (var str in obj) this[str] = obj[str];
        }
    }


    export class BleCharacteristic {
        descriptors: BleDescriptor[]
        uuid: string;
        name: string
        handle: number;
        writeType: number;
        properties: number;
        permissions: number;

        onDescriptorsLoaded: Function;   

        private descrObj: any        

        getDescriptorByUUID(uuid: string): BleDescriptor {
            return this.descrObj[uuid];
        }

        getDescriptorByNmae(name: string): BleDescriptor {
            var ds: BleDescriptor[] = this.descriptors;
            for (var i = 0, n = ds.length; i < n; i++) if (ds[i].name == name) return ds[i];
            return null;
           
        }
        constructor(private device: BleDevice, obj) {
            for (var str in obj) this[str] = obj[str]
            this.descriptors = [];
            this.descrObj = {};
        }
       
        descriptorsCallback( descriptors: BleDescriptor[]): void {          
            var CONSTS: any = this.device.CONSTS;
           
            for (var i = 0, n = descriptors.length; i < n; ++i) {
                var descriptor: BleDescriptor = new BleDescriptor( descriptors[i]);
                descriptor.name = CONSTS[descriptor.uuid] || descriptor.uuid;
                this.descrObj[descriptor.uuid] = descriptor;
                this.descriptors.push(descriptor);            
            }
           this.onDescriptorsLoaded && this.onDescriptorsLoaded();

        }

        loadDescriptors(callBack: Function): void {
            this.onDescriptorsLoaded = callBack;
            evothings.ble.descriptors(this.device.deviceHandle, this.handle,(descriptors) => this.descriptorsCallback(descriptors),(err)=>this.device.logError(err));
        }             

    }

  
    ////////////////////////////////////////////////////////////BLE Service Classs////////////////////////////////////////////////////////////////

    export class BleService {
        handle: number;
        type: number;
        name: string;
        characteristics: BleCharacteristic[];
        uuid: string;
        onError: Function;
        onCharacteristics: Function;
        onDescriptors: Function;       
        private deviceHandle:number

        private charsObj: any;
        
        getCharacteristicsByName(name: string): BleCharacteristic {
            //for (var i = 0, n = this.characteristics.length; i < n; i++) if (this.characteristics[i].name == name) return this.characteristics[i];
            return this.charsObj[name]
        }
       
        constructor(private device:BleDevice,obj: { uuid: string; handle: number; type: number }) {
            for (var str in obj) this[str] = obj[str]
            this.characteristics = [];
            this.charsObj = {};
            this.deviceHandle = device.deviceHandle;           
        }
            
        private curentCharNum: number;  
        loadAllDescriptors(): void {
            this.curentCharNum = -1;
            this.loadNextDescriptors();
        }
        
        private loadNextDescriptors(): void {
            this.curentCharNum++
            if (this.characteristics.length > this.curentCharNum) {
                var char: BleCharacteristic = this.characteristics[this.curentCharNum];             
                char.loadDescriptors(() => this.loadNextDescriptors());

            } else this.onDescriptors();
        }
        characteristicsCallback(characteristics: BleCharacteristic[]): void {        
            var CONSTS = this.device.CONSTS;
            for (var i = 0; i < characteristics.length; ++i) {
               // console.log(characteristics[i]);
                var characteristic: BleCharacteristic = new BleCharacteristic(this.device,characteristics[i]);
                characteristic.name = CONSTS[characteristic.uuid];               
                this.charsObj[characteristic.name] = characteristic;
                this.characteristics.push(characteristic);
                 //console.log('   characteristicsCallbackFun ' + characteristic.name);
               
            }

            this.onCharacteristics && this.onCharacteristics();
            this.onDescriptors && this.loadAllDescriptors();    
        }


       
        loadCharacteristics():void  {           
            evothings.ble.characteristics(this.device.deviceHandle, this.handle,(chs: BleCharacteristic[]) => this.characteristicsCallback(chs),(err)=>this.device.logError(err));
        }

         ///////////////////////////////////////////////////////////////
        readCharacteristic(characteristic: BleCharacteristic, win) {
            evothings.ble.readCharacteristic(this.deviceHandle, characteristic.handle, win,(err) => this.logError(err));
        }



        readDescriptor(characteristic: BleCharacteristic, descriptor: BleDescriptor, win) {
            evothings.ble.readDescriptor(this.deviceHandle, descriptor.handle, win,(err) => this.logError(err));
        }        
        writeCharacteristic(characteristic: BleCharacteristic, value, win) {
            evothings.ble.writeCharacteristic(this.deviceHandle, characteristic.handle, value, win,(err) => this.logError(err));
        }       

        getCharacteristicDataNotification(): BleDescriptor {
            return this.getCharacteristicsByName('DATA').getDescriptorByNmae('NOTIFICATION');
        }
        getCharacteristicData(): BleCharacteristic {
            return this.getCharacteristicsByName('DATA');
        }
        getDescriptorOf(charname: string, descrName: string): BleDescriptor {
            return this.getCharacteristicsByName(charname).getDescriptorByNmae(descrName);
        }
        turnOn(success:Function) {
            evothings.ble.writeDescriptor(this.deviceHandle, this.getCharacteristicDataNotification().handle, new Uint8Array([1, 0]), success ,(err) => this.logError(err));
        }
        writeProperty(name:string, value:any, success:Function): void {
            evothings.ble.writeCharacteristic(this.deviceHandle, this.getCharacteristicsByName(name).handle, value,success,(err) => this.logError(err));
        }
        readProperty(name:string, success: Function): void {
            evothings.ble.readCharacteristic(this.deviceHandle, this.getCharacteristicsByName(name).handle, success,(err) => this.logError(err));
        }
        config(value: any, callBack): void {
            evothings.ble.writeCharacteristic(this.deviceHandle, this.getCharacteristicsByName('CONFIG').handle, value, callBack,(err) => this.logError(err));
        }
        setCallBack(success: Function): void {
            evothings.ble.enableNotification(this.deviceHandle, this.getCharacteristicData().handle, success,(err) => this.logError(err));
        }
      
        writeDescriptor(characteristic: BleCharacteristic, descriptor: BleDescriptor, value, win) {
            evothings.ble.writeDescriptor(this.deviceHandle, descriptor.handle, value, win,(err) => this.logError(err));
        }      
        enableNotification(characteristic: BleCharacteristic, win) {
            evothings.ble.enableNotification(this.deviceHandle, characteristic.handle, win,(err) => this.logError(err));
        }
        turnOFF(callBack:Function) {
            evothings.ble.disableNotification(this.deviceHandle,this.getCharacteristicData().handle, callBack,(err) => this.logError(err));        

        }
        disableNotification(characteristic: BleCharacteristic, win) {
            evothings.ble.disableNotification(this.deviceHandle, characteristic.handle, win,(err) => this.logError(err));
        }  
        
        logError(err): void {
            if (this.onError) this.onError(err)
            else console.log('ERRROR ' + err);
        }     
                
    }
    //////////////////////////////////////////////////////BLE Device Class///////////////////////////////////////////////////

    export class BleDevice {
       deviceHandle: number;
       CONSTS: any;        
        onError: Function;

        private services: BleService[];
        private servicesObj: any ;
        private onDiscovered: Function       

        constructor(public address: string, public rssi: number,public name: string) {

        }
     
       
        private onConnected(connectInfo: { state: number; deviceHandle: number }): void {
            if (connectInfo.state == 2) {// connected	
             
                    this.deviceHandle = connectInfo.deviceHandle;
                    evothings.ble.services(this.deviceHandle,(services) => this.onServices(services),(err) => this.logError(err)); 
                
                
            }
            else if (connectInfo.state == 0) {// disconnected     
             
               
            }
            
        }
        private connect() {
            evothings.ble.connect(this.address,(res) => this.onConnected(res),(err) => this.logError(err));            
        }       
     

        private currentService: number;

        private onServiceLoaded(): void {
            this.loadNextServiceCracteristics();
        }      

        private loadCharacteristics(): void {
            this.currentService = -1;
            this.loadNextServiceCracteristics();
        }
        private loadNextServiceCracteristics(): void {
            this.currentService++;
            var serv: BleService
            if (this.services.length > this.currentService) {
                serv = this.services[this.currentService];               
                serv.onDescriptors = () => this.onServiceLoaded();
                serv.loadCharacteristics();
            } else this.onDiscovered && this.onDiscovered();

            //console.log(this.currentService + ' loadNextCracteristics  ' + (serv && serv.name));
        }

        private onServices(services: { uuid: string; type: number; handle: number }[]): void {
            var CONSTS = this.CONSTS;
            this.services = []
            this.servicesObj = {};
            for (var i = 0; i < services.length; ++i) {
                var service = new BleService(this, services[i]);
                service.name = CONSTS[service.uuid] || service.uuid;
                this.servicesObj[service.name] = service;
                this.services.push(service);
                
            }
            this.loadCharacteristics();
        }

        logError(err): void {
            if (this.onError) this.onError(err)
            else console.log('ERRROR ' + err);
        }

        getAllServices(): BleService[] {
            return this.services;
        }
        getServicById(id: number): BleService {
            return this.services[id];
        }
        getServiceByName(name: string): BleService {
            return this.servicesObj[name];
        }

        disconnect() {
            this.deviceHandle && evothings.ble.close(this.deviceHandle);
        }
        readRSSI(win, fail) {
            evothings.ble.rssi(this.deviceHandle, win, fail);
        }		
        
        discover(CONSTS, callBack) {    
            this.CONSTS = CONSTS;
            this.onDiscovered = callBack;
            this.connect();                         
        } 

        reconnect(callBack): void {
            this.onDiscovered = callBack;
            this.connect(); 
           // evothings.ble.connect(this.address, callBack,(err) => this.logError(err));  
        }
        
      
    }

    ///////////////////////////////////////////////// BLE Scanner Class///////////////////////////////////////////////////////////////
    
    export class BleScanner {
        knownDevices: {} = {};
        connectedDevices: {} = {}
        reportOnce: boolean = false;
        name: string = 'EasyBle';     
        onError: Function;

        logError(err): void {
            if (this.onError) this.onError(err);
            else console.log('ERROR BleConnect : ' + JSON.stringify(err));
        }

        constructor() {
        }
        private onFail(result): void {
            this.onError && this.onError(result);
            console.log(this.name, result);
        }      
       
        stopScan(success:Function): void {
            evothings.ble.stopScan(success,(result)=>this.onFail(result));
        }      

        startScan(win: Function) { 
            this.stopScan(()=> {});         
            evothings.ble.startScan(win,(err)=>this.logError(err));
        }             

    }


}