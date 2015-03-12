/// <reference path="typings/evothingsble.d.ts" />
var easy_ble;
(function (easy_ble) {
    var CharacteristicsParser = (function () {
        function CharacteristicsParser(device, serviceUUIDs, win, fail) {
            var _this = this;
            this.device = device;
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
                    evothings.ble.characteristics(device.deviceHandle, service.handle, function (characteristics) { return _this.characteristicsCallbackFun(service, characteristics, win, fail); }, fail);
                }
            }
            else {
                // Read info for all services.
                this.readCounter = device.__services.length;
                for (var i = 0; i < device.__services.length; ++i) {
                    var service = device.__services[i];
                    evothings.ble.characteristics(device.deviceHandle, service.handle, function (characteristics) { return _this.characteristicsCallbackFun(service, characteristics, win, fail); }, fail);
                }
            }
        }
        CharacteristicsParser.prototype.descriptorsCallbackFun = function (characteristic, descriptors, win) {
            --this.readCounter; // Decrements the count added by characteristics.
            console.log('descriptors');
            console.log(descriptors);
            characteristic.__descriptors = [];
            for (var i = 0, n = descriptors.length; i < n; ++i) {
                var descriptor = descriptors[i];
                characteristic.__descriptors.push(descriptor);
                this.device.__uuidMap[characteristic.uuid + ':' + descriptor.uuid] = descriptor;
            }
            if (0 == this.readCounter)
                win(this.device);
        };
        CharacteristicsParser.prototype.characteristicsCallbackFun = function (service, characteristics, win, fail) {
            var _this = this;
            --this.readCounter;
            this.readCounter += characteristics.length;
            if (!service.__characteristics)
                service.__characteristics = [];
            for (var i = 0; i < characteristics.length; ++i) {
                var characteristic = characteristics[i];
                service.__characteristics.push(characteristic);
                this.device.__uuidMap[characteristic.uuid] = characteristic;
                evothings.ble.descriptors(this.device.deviceHandle, characteristic.handle, function (descriptors) { return _this.descriptorsCallbackFun(characteristic, descriptors, win); }, fail);
            }
        };
        return CharacteristicsParser;
    })();
    var BleDevice = (function () {
        function BleDevice(easy, address, rssi, name) {
            this.easy = easy;
            this.address = address;
            this.rssi = rssi;
            this.name = name;
            this.__uuidMap = {};
            this.__services = [];
            this.disableNotification = function (characteristicUUID, win, fail) {
                var characteristic = this.__uuidMap[characteristicUUID];
                if (!characteristic)
                    fail('Characteristic not found: ' + characteristicUUID);
                else
                    evothings.ble.disableNotification(this.deviceHandle, characteristic.handle, win, fail);
                console.log('disableNotification ', this.deviceHandle, characteristic.handle);
            };
        }
        BleDevice.prototype.connect = function (win, fail) {
            this.easy.connectToDevice(this, win, fail);
        };
        BleDevice.prototype.close = function () {
            this.deviceHandle && evothings.ble.close(this.deviceHandle);
        };
        BleDevice.prototype.readRSSI = function (win, fail) {
            evothings.ble.rssi(this.deviceHandle, win, fail);
        };
        /** Read all service info for the specified service UUIDs.
        // If serviceUUIDs is null, info for all services is read
        // (this can be time-consuming compared to reading a
        // selected number of services). */
        BleDevice.prototype.onServices = function (serviceUUIDs, services, win, fail) {
            console.log('onServices');
            console.log(services);
            this.__services = [];
            for (var i = 0; i < services.length; ++i) {
                var service = services[i];
                this.__services.push(service);
                this.__uuidMap[service.uuid] = service;
            }
            new CharacteristicsParser(this, serviceUUIDs, win, fail);
        };
        BleDevice.prototype.readServices = function (serviceUUIDs, win, fail) {
            var _this = this;
            console.log('serviceUUIDs ', serviceUUIDs);
            evothings.ble.services(this.deviceHandle, function (services) { return _this.onServices(serviceUUIDs, services, win, fail); }, fail);
        };
        BleDevice.prototype.readCharacteristic = function (characteristicUUID, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic)
                fail('Characteristic not found: ' + characteristicUUID);
            else
                evothings.ble.readCharacteristic(this.deviceHandle, characteristic.handle, win, fail);
        };
        BleDevice.prototype.readDescriptor = function (characteristicUUID, descriptorUUID, win, fail) {
            var descriptor = this.__uuidMap[characteristicUUID + ':' + descriptorUUID];
            if (!descriptor)
                fail('Descriptor not found: ' + descriptorUUID);
            else
                evothings.ble.readDescriptor(this.deviceHandle, descriptor.handle, function () {
                    win();
                }, function (errorCode) {
                    fail(errorCode);
                });
        };
        /** Write value of characteristic. */
        BleDevice.prototype.writeCharacteristic = function (characteristicUUID, value, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic)
                fail('Characteristic not found: ' + characteristicUUID);
            else
                evothings.ble.writeCharacteristic(this.deviceHandle, characteristic.handle, value, function () {
                    win();
                }, function (errorCode) {
                    fail(errorCode);
                });
        };
        BleDevice.prototype.writeDescriptor = function (characteristicUUID, descriptorUUID, value, win, fail) {
            var descriptor = this.__uuidMap[characteristicUUID + ':' + descriptorUUID];
            if (!descriptor)
                fail('Descriptor not found: ' + descriptorUUID);
            else
                evothings.ble.writeDescriptor(this.deviceHandle, descriptor.handle, value, function () {
                    win();
                }, function (errorCode) {
                    fail(errorCode);
                });
        };
        BleDevice.prototype.enableNotification = function (characteristicUUID, win, fail) {
            var characteristic = this.__uuidMap[characteristicUUID];
            if (!characteristic)
                fail('Characteristic not found: ' + characteristicUUID);
            else
                evothings.ble.enableNotification(this.deviceHandle, characteristic.handle, win, fail);
            console.log('enableNotification ', this.deviceHandle, characteristic.handle);
        };
        return BleDevice;
    })();
    easy_ble.BleDevice = BleDevice;
    var BleConnect = (function () {
        function BleConnect() {
            this.knownDevices = {};
            this.connectedDevices = {};
            this.reportOnce = false;
            this.name = 'EasyBle';
        }
        BleConnect.prototype.onFail = function (result) {
            console.log(this.name, result);
        };
        BleConnect.prototype.onStopScanSuccess = function (result) {
            console.log('onStopScanSuccess ', result);
        };
        BleConnect.prototype.reportDeviceOnce = function (reportOnce) {
            this.reportOnce = reportOnce;
        };
        BleConnect.prototype.stopScan = function () {
            var _this = this;
            evothings.ble.stopScan(function (result) { return _this.onStopScanSuccess(result); }, function (result) { return _this.onFail(result); });
        };
        BleConnect.prototype.onScanComplete = function (device, win) {
            var existingDevice = this.knownDevices[device.address];
            if (existingDevice) {
                if (this.reportOnce) {
                    return;
                }
                existingDevice.rssi = device.rssi;
                existingDevice.name = device.name;
                win(existingDevice);
            }
            else {
                var dev = new BleDevice(this, device.address, device.rssi, device.name);
                this.knownDevices[device.address] = dev;
                win(dev);
            }
        };
        BleConnect.prototype.startScan = function (win, fail) {
            var _this = this;
            this.stopScan();
            this.knownDevices = {};
            evothings.ble.startScan(function (device) { return _this.onScanComplete(device, win); }, fail);
        };
        BleConnect.prototype.onDeviceConnect = function (device, connectInfo, win, fail) {
            console.log('onDeviceConnect ', connectInfo);
            if (connectInfo.state == 2) {
                device.deviceHandle = connectInfo.deviceHandle;
                device.__uuidMap = {};
                this.connectedDevices[device.address] = device;
                win(device);
            }
            else if (connectInfo.state == 0) {
                this.connectedDevices[device.address] = null;
                // TODO: How to signal disconnect?
                // Call error callback?
                // Additional callback? (connect, disconnect, fail)
                // Additional parameter on win callback with connect state?
                // (Last one is the best option I think).
                fail && fail('disconnected');
            }
        };
        BleConnect.prototype.connectToDevice = function (device, win, fail) {
            var _this = this;
            evothings.ble.connect(device.address, function (connectInfo) { return _this.onDeviceConnect(device, connectInfo, win, fail); }, fail);
        };
        return BleConnect;
    })();
    easy_ble.BleConnect = BleConnect;
})(easy_ble || (easy_ble = {}));
//# sourceMappingURL=EasyBle.js.map