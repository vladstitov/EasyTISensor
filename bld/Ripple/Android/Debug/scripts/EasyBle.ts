﻿/// <reference path="typings/evothingsble.d.ts" />
module easyble {
    import ble = evothings.ble;

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
                    ble.characteristics(device.deviceHandle, service.handle,(characteristics) => this.characteristicsCallbackFun(service, characteristics, win, fail), fail);
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
            if (0 == this.readCounter) win(device);
            
        
        }

        characteristicsCallbackFun(service: BleService, characteristics,win,fail) {
            --this.readCounter;
            this.readCounter += characteristics.length;
            for (var i = 0; i < characteristics.length; ++i) {
                var characteristic = characteristics[i];
                service.__characteristics.push(characteristic);
                this.device.__uuidMap[characteristic.uuid] = characteristic; 
                              
                ble.descriptors(this.device.deviceHandle, characteristic.handle,(descriptors) => this.descriptorsCallbackFun(characteristic, descriptors,win),fail);
            }
        }
    }



    export class BleDevice {
        deviceHandle: number;
        __uuidMap: any;
        __services: any[];
        constructor(private easy:EasyBle,public address: string, public rssi: number,public name: string) {

        }
        connect = function (win, fail) {
            this.easy.connectToDevice(this, win, fail);
        }
       
        close() {
            this.deviceHandle && ble.close(this.deviceHandle);
        }        
        readRSSI (win, fail) {
            ble.rssi(this.deviceHandle, win, fail);
        }
		/** Read all service info for the specified service UUIDs.
		// If serviceUUIDs is null, info for all services is read
		// (this can be time-consuming compared to reading a
		// selected number of services). */

        private onServices(serviceUUIDs,services,win:Function,fail:Function): void {
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
          ble.services(this.deviceHandle,(services) => this.onServices(serviceUUIDs,services,win,fail),fail);

                  
        }    

    }


    
    export class EasyBle {
        knownDevices: {} = {};
        connectedDevices: {} = {}
        reportOnce: boolean = false;
        name: string = 'EasyBle';
        constructor(device: BleDevice) {

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
            ble.stopScan((result)=>this.onStopScanSuccess(result),(result)=>this.onFail(result));
        }
        private onScanComplete(device: { address: string; rssi: number;name:string}, win: Function): void {
            var existingDevice: BleDevice = this.knownDevices[device.address]
            if (existingDevice) {

                if (this.reportOnce) { return; }
                existingDevice.rssi = device.rssi;
                existingDevice.name = device.name;
                win(existingDevice);
            } else {
                this.knownDevices[device.address] = new BleDevice(this,device.address,device.rssi,device.name);                
                //this.addMethodsToDeviceObject(device);                 
                win(device);

            }
        }

        startScan(win: Function, fail: Function) {
            this.stopScan();
            this.knownDevices = {};
            ble.startScan((device) => this.onScanComplete(device, win), fail);

        }

        private onDeviceConnect(device: BleDevice, connectInfo: { state: number; deviceHandle:number}, win:Function,fail:Function): void {
            if (connectInfo.state == 2) {// connected			
                device.deviceHandle = connectInfo.deviceHandle;
                device.__uuidMap = {};
                this.connectedDevices[device.address] = device;
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
            ble.connect(device.address,(connectInfo: { state: number; deviceHandle: number }) => this.onDeviceConnect(device, connectInfo, win, fail), fail);
        }

    }


}