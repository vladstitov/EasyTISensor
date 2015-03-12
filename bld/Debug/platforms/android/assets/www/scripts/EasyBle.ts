/// <reference path="typings/evothingsble.d.ts" />
module easy_ble {
   // import ble = evothings.ble;
    //evothings.ble
    interface BleService {
        serviceUUID: string;
        __characteristics: any[];
        uuid: string;

    }
    interface BleCharacteristics {
        __descriptors: { uuid: string; }[];
        uuid: string;
    }
    
    class CharacteristicsParser {
        private readCounter: number;

        constructor(private device: BleDevice, serviceUUIDs: any[], win: Function, fail: Function) {
            this.readCounter = 0;
            if (serviceUUIDs) {
                // Read info for service UUIDs.
                this.readCounter = serviceUUIDs.length;
                for (var i = 0; i < serviceUUIDs.length; ++i) {
                    var uuid = serviceUUIDs[i];
                    var service = device.__uuidMap[uuid];
                    if (!service) {
                        fail('Service not found: ' + uuid);
                        return;
                    }
                    evothings.ble.characteristics(device.deviceHandle, service.handle,(characteristics) => this.characteristicsCallbackFun(service, characteristics, win, fail), fail);
                }
            }
            else {
                // Read info for all services.
                this.readCounter = device.__services.length;
                for (var i = 0; i < device.__services.length; ++i) {
                    var service = device.__services[i];
                    evothings.ble.characteristics(device.deviceHandle, service.handle,(characteristics) => this.characteristicsCallbackFun(service, characteristics, win, fail), fail);
                }
            }

        }
        descriptorsCallbackFun(characteristic: BleCharacteristics, descriptors: { uuid:string;}[],win:Function): void {
            --this.readCounter; // Decrements the count added by characteristics.
            console.log('descriptors');
            console.log(descriptors);          
            characteristic.__descriptors = [];
            for (var i = 0, n = descriptors.length; i < n; ++i) {
                var descriptor = descriptors[i];
                characteristic.__descriptors.push(descriptor);
                this.device.__uuidMap[characteristic.uuid + ':' + descriptor.uuid] = descriptor;
            }
            if (0 == this.readCounter) win(this.device);
            
        
        }

        characteristicsCallbackFun(service: BleService, characteristics,win,fail) {
            --this.readCounter;
            this.readCounter += characteristics.length;
            if (!service.__characteristics) service.__characteristics = [];
            for (var i = 0; i < characteristics.length; ++i) {
                var characteristic = characteristics[i];
                service.__characteristics.push(characteristic);
                this.device.__uuidMap[characteristic.uuid] = characteristic; 
                              
                evothings.ble.descriptors(this.device.deviceHandle, characteristic.handle,(descriptors) => this.descriptorsCallbackFun(characteristic, descriptors,win),fail);
            }
        }
    }



    export class BleDevice {
        deviceHandle: number;
        __uuidMap: any = {};
        __services: any[]=[];
        constructor(private easy:BleConnect,public address: string, public rssi: number,public name: string) {

        }
        connect(win, fail) {

            this.easy.connectToDevice(this, win, fail);
        }
       
        close() {
            this.deviceHandle && evothings.ble.close(this.deviceHandle);
        }        
        readRSSI (win, fail) {
            evothings.ble.rssi(this.deviceHandle, win, fail);
        }
		/** Read all service info for the specified service UUIDs.
		// If serviceUUIDs is null, info for all services is read
		// (this can be time-consuming compared to reading a
		// selected number of services). */

        private onServices(serviceUUIDs, services, win: Function, fail: Function): void {
            console.log('onServices')
            console.log(services);
            this.__services = []
            for (var i = 0; i < services.length; ++i) {
                var service = services[i];
                this.__services.push(service);
               this.__uuidMap[service.uuid] = service;
            }
            new CharacteristicsParser(this,serviceUUIDs, win, fail);
        }

        readServices(serviceUUIDs, win, fail) {          
          console.log('serviceUUIDs ', serviceUUIDs);
          evothings.ble.services(this.deviceHandle,(services) => this.onServices(serviceUUIDs,services,win,fail),fail);                  
        }  
        readCharacteristic(characteristicUUID, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic) fail('Characteristic not found: ' + characteristicUUID);                
            else evothings.ble.readCharacteristic(this.deviceHandle, characteristic.handle, win, fail);
        }

       
        readDescriptor (characteristicUUID, descriptorUUID, win, fail) {
            var descriptor = this.__uuidMap[characteristicUUID + ':' + descriptorUUID];
            if (!descriptor)  fail('Descriptor not found: ' + descriptorUUID);
           else  evothings.ble.readDescriptor(this.deviceHandle, descriptor.handle, function () { win(); }, function (errorCode) { fail(errorCode); });
        }

        /** Write value of characteristic. */
        writeCharacteristic(characteristicUUID, value, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic)  fail('Characteristic not found: ' + characteristicUUID);
             else  evothings.ble.writeCharacteristic(this.deviceHandle, characteristic.handle, value, function () { win(); }, function (errorCode) { fail(errorCode); });
        }

       
        writeDescriptor(characteristicUUID, descriptorUUID, value, win, fail) {
            var descriptor = this.__uuidMap[characteristicUUID + ':' + descriptorUUID];
            if (!descriptor)fail('Descriptor not found: ' + descriptorUUID);
            else evothings.ble.writeDescriptor(this.deviceHandle, descriptor.handle, value, function () { win(); }, function (errorCode) { fail(errorCode); });
        }

       
        enableNotification(characteristicUUID, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic)  fail('Characteristic not found: ' + characteristicUUID);             
            else  evothings.ble.enableNotification(this.deviceHandle, characteristic.handle, win, fail);
            console.log('enableNotification ', this.deviceHandle, characteristic.handle);
        }       
        disableNotification = function (characteristicUUID, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic) fail('Characteristic not found: ' + characteristicUUID);             
           else  evothings.ble.disableNotification(this.deviceHandle, characteristic.handle, win, fail);
            console.log('disableNotification ', this.deviceHandle, characteristic.handle);
        }
        
          

    }


    
    export class BleConnect {
        knownDevices: {} = {};
        connectedDevices: {} = {}
        reportOnce: boolean = false;
        name: string = 'EasyBle';
        constructor() {
        }


        private onFail(result): void {
            console.log(this.name, result);
        }

        private onStopScanSuccess(result): void {
            console.log('onStopScanSuccess ',result);

        }
        reportDeviceOnce(reportOnce: boolean): void {
            this.reportOnce = reportOnce;
        }
        stopScan(): void {
            evothings.ble.stopScan((result)=>this.onStopScanSuccess(result),(result)=>this.onFail(result));
        }
        private onScanComplete(device: { address: string; rssi: number;name:string}, win: Function): void {
            var existingDevice: BleDevice = this.knownDevices[device.address]
            if (existingDevice) {
                if (this.reportOnce) { return; }
                existingDevice.rssi = device.rssi;
                existingDevice.name = device.name;
                win(existingDevice);
            } else {
                var dev: BleDevice  = new BleDevice(this, device.address, device.rssi, device.name);   
                this.knownDevices[device.address] = dev;                            
                win(dev);
            }
        }

        startScan(win: Function, fail: Function) {
            this.stopScan();
            this.knownDevices = {};
            evothings.ble.startScan((device) => this.onScanComplete(device, win), fail);

        }

        private onDeviceConnect(device: BleDevice, connectInfo: { state: number; deviceHandle: number }, win: Function, fail: Function): void {
            console.log('onDeviceConnect ', connectInfo);
            if (connectInfo.state == 2) {// connected			
                device.deviceHandle = connectInfo.deviceHandle;
                device.__uuidMap = {};
                this.connectedDevices[device.address] = device
                win(device);
            }
            else if (connectInfo.state == 0) {// disconnected           
                this.connectedDevices[device.address] = null;
                // TODO: How to signal disconnect?
                // Call error callback?
                // Additional callback? (connect, disconnect, fail)
                // Additional parameter on win callback with connect state?
                // (Last one is the best option I think).
                fail && fail('disconnected');
            }

        }

        connectToDevice(device: BleDevice, win: (device: BleDevice) => void, fail:Function):void {
            evothings.ble.connect(device.address,(connectInfo: { state: number; deviceHandle: number }) => this.onDeviceConnect(device, connectInfo, win, fail), fail);
        }

    }


}