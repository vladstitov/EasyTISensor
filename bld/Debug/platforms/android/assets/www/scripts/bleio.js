/// <reference path="typings/evothingsble.d.ts" />
var bleio;
(function (bleio) {
    var BleDescriptor = (function () {
        function BleDescriptor(obj) {
            for (var str in obj)
                this[str] = obj[str];
        }
        return BleDescriptor;
    })();
    bleio.BleDescriptor = BleDescriptor;
    var BleCharacteristic = (function () {
        function BleCharacteristic(device, obj) {
            this.device = device;
            for (var str in obj)
                this[str] = obj[str];
            this.descriptors = [];
            this.descrObj = {};
        }
        BleCharacteristic.prototype.getDescriptorByUUID = function (uuid) {
            return this.descrObj[uuid];
        };
        BleCharacteristic.prototype.getDescriptorByNmae = function (name) {
            var ds = this.descriptors;
            for (var i = 0, n = ds.length; i < n; i++)
                if (ds[i].name == name)
                    return ds[i];
            return null;
        };
        BleCharacteristic.prototype.descriptorsCallback = function (descriptors) {
            var CONSTS = this.device.CONSTS;
            for (var i = 0, n = descriptors.length; i < n; ++i) {
                var descriptor = new BleDescriptor(descriptors[i]);
                descriptor.name = CONSTS[descriptor.uuid] || descriptor.uuid;
                this.descrObj[descriptor.uuid] = descriptor;
                this.descriptors.push(descriptor);
            }
            this.onDescriptorsLoaded && this.onDescriptorsLoaded();
        };
        BleCharacteristic.prototype.loadDescriptors = function (callBack) {
            var _this = this;
            this.onDescriptorsLoaded = callBack;
            evothings.ble.descriptors(this.device.deviceHandle, this.handle, function (descriptors) { return _this.descriptorsCallback(descriptors); }, function (err) { return _this.device.logError(err); });
        };
        return BleCharacteristic;
    })();
    bleio.BleCharacteristic = BleCharacteristic;
    ////////////////////////////////////////////////////////////BLE Service Classs////////////////////////////////////////////////////////////////
    var BleService = (function () {
        function BleService(device, obj) {
            this.device = device;
            for (var str in obj)
                this[str] = obj[str];
            this.characteristics = [];
            this.charsObj = {};
            this.deviceHandle = device.deviceHandle;
        }
        BleService.prototype.getCharacteristicsByName = function (name) {
            //for (var i = 0, n = this.characteristics.length; i < n; i++) if (this.characteristics[i].name == name) return this.characteristics[i];
            return this.charsObj[name];
        };
        BleService.prototype.loadAllDescriptors = function () {
            this.curentCharNum = -1;
            this.loadNextDescriptors();
        };
        BleService.prototype.loadNextDescriptors = function () {
            var _this = this;
            this.curentCharNum++;
            if (this.characteristics.length > this.curentCharNum) {
                var char = this.characteristics[this.curentCharNum];
                char.loadDescriptors(function () { return _this.loadNextDescriptors(); });
            }
            else
                this.onDescriptors();
        };
        BleService.prototype.characteristicsCallback = function (characteristics) {
            var CONSTS = this.device.CONSTS;
            for (var i = 0; i < characteristics.length; ++i) {
                // console.log(characteristics[i]);
                var characteristic = new BleCharacteristic(this.device, characteristics[i]);
                characteristic.name = CONSTS[characteristic.uuid];
                this.charsObj[characteristic.name] = characteristic;
                this.characteristics.push(characteristic);
            }
            this.onCharacteristics && this.onCharacteristics();
            this.onDescriptors && this.loadAllDescriptors();
        };
        BleService.prototype.loadCharacteristics = function () {
            var _this = this;
            evothings.ble.characteristics(this.device.deviceHandle, this.handle, function (chs) { return _this.characteristicsCallback(chs); }, function (err) { return _this.device.logError(err); });
        };
        ///////////////////////////////////////////////////////////////
        BleService.prototype.readCharacteristic = function (characteristic, win) {
            var _this = this;
            evothings.ble.readCharacteristic(this.deviceHandle, characteristic.handle, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.readDescriptor = function (characteristic, descriptor, win) {
            var _this = this;
            evothings.ble.readDescriptor(this.deviceHandle, descriptor.handle, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.writeCharacteristic = function (characteristic, value, win) {
            var _this = this;
            evothings.ble.writeCharacteristic(this.deviceHandle, characteristic.handle, value, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.getCharacteristicDataNotification = function () {
            return this.getCharacteristicsByName('DATA').getDescriptorByNmae('NOTIFICATION');
        };
        BleService.prototype.getCharacteristicData = function () {
            return this.getCharacteristicsByName('DATA');
        };
        BleService.prototype.getDescriptorOf = function (charname, descrName) {
            return this.getCharacteristicsByName(charname).getDescriptorByNmae(descrName);
        };
        BleService.prototype.turnOn = function (success) {
            var _this = this;
            evothings.ble.writeDescriptor(this.deviceHandle, this.getCharacteristicDataNotification().handle, new Uint8Array([1, 0]), success, function (err) { return _this.logError(err); });
        };
        BleService.prototype.writeProperty = function (name, value, success) {
            var _this = this;
            evothings.ble.writeCharacteristic(this.deviceHandle, this.getCharacteristicsByName(name).handle, value, success, function (err) { return _this.logError(err); });
        };
        BleService.prototype.readProperty = function (name, success) {
            var _this = this;
            evothings.ble.readCharacteristic(this.deviceHandle, this.getCharacteristicsByName(name).handle, success, function (err) { return _this.logError(err); });
        };
        BleService.prototype.config = function (value, callBack) {
            var _this = this;
            evothings.ble.writeCharacteristic(this.deviceHandle, this.getCharacteristicsByName('CONFIG').handle, value, callBack, function (err) { return _this.logError(err); });
        };
        BleService.prototype.setCallBack = function (success) {
            var _this = this;
            evothings.ble.enableNotification(this.deviceHandle, this.getCharacteristicData().handle, success, function (err) { return _this.logError(err); });
        };
        BleService.prototype.writeDescriptor = function (characteristic, descriptor, value, win) {
            var _this = this;
            evothings.ble.writeDescriptor(this.deviceHandle, descriptor.handle, value, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.enableNotification = function (characteristic, win) {
            var _this = this;
            evothings.ble.enableNotification(this.deviceHandle, characteristic.handle, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.turnOFF = function (callBack) {
            var _this = this;
            evothings.ble.disableNotification(this.deviceHandle, this.getCharacteristicData().handle, callBack, function (err) { return _this.logError(err); });
        };
        BleService.prototype.disableNotification = function (characteristic, win) {
            var _this = this;
            evothings.ble.disableNotification(this.deviceHandle, characteristic.handle, win, function (err) { return _this.logError(err); });
        };
        BleService.prototype.logError = function (err) {
            if (this.onError)
                this.onError(err);
            else
                console.log('ERRROR ' + err);
        };
        return BleService;
    })();
    bleio.BleService = BleService;
    //////////////////////////////////////////////////////BLE Device Class///////////////////////////////////////////////////
    var BleDevice = (function () {
        function BleDevice(address, rssi, name) {
            this.address = address;
            this.rssi = rssi;
            this.name = name;
        }
        BleDevice.prototype.onConnected = function (connectInfo) {
            var _this = this;
            if (connectInfo.state == 2) {
                this.deviceHandle = connectInfo.deviceHandle;
                evothings.ble.services(this.deviceHandle, function (services) { return _this.onServices(services); }, function (err) { return _this.logError(err); });
            }
            else if (connectInfo.state == 0) {
            }
        };
        BleDevice.prototype.connect = function () {
            var _this = this;
            evothings.ble.connect(this.address, function (res) { return _this.onConnected(res); }, function (err) { return _this.logError(err); });
        };
        BleDevice.prototype.onServiceLoaded = function () {
            this.loadNextServiceCracteristics();
        };
        BleDevice.prototype.loadCharacteristics = function () {
            this.currentService = -1;
            this.loadNextServiceCracteristics();
        };
        BleDevice.prototype.loadNextServiceCracteristics = function () {
            var _this = this;
            this.currentService++;
            var serv;
            if (this.services.length > this.currentService) {
                serv = this.services[this.currentService];
                serv.onDescriptors = function () { return _this.onServiceLoaded(); };
                serv.loadCharacteristics();
            }
            else
                this.onDiscovered && this.onDiscovered();
            //console.log(this.currentService + ' loadNextCracteristics  ' + (serv && serv.name));
        };
        BleDevice.prototype.onServices = function (services) {
            var CONSTS = this.CONSTS;
            this.services = [];
            this.servicesObj = {};
            for (var i = 0; i < services.length; ++i) {
                var service = new BleService(this, services[i]);
                service.name = CONSTS[service.uuid] || service.uuid;
                this.servicesObj[service.name] = service;
                this.services.push(service);
            }
            this.loadCharacteristics();
        };
        BleDevice.prototype.logError = function (err) {
            if (this.onError)
                this.onError(err);
            else
                console.log('ERRROR ' + err);
        };
        BleDevice.prototype.getAllServices = function () {
            return this.services;
        };
        BleDevice.prototype.getServicById = function (id) {
            return this.services[id];
        };
        BleDevice.prototype.getServiceByName = function (name) {
            return this.servicesObj[name];
        };
        BleDevice.prototype.disconnect = function () {
            this.deviceHandle && evothings.ble.close(this.deviceHandle);
        };
        BleDevice.prototype.readRSSI = function (win, fail) {
            evothings.ble.rssi(this.deviceHandle, win, fail);
        };
        BleDevice.prototype.discover = function (CONSTS, callBack) {
            this.CONSTS = CONSTS;
            this.onDiscovered = callBack;
            this.connect();
        };
        BleDevice.prototype.reconnect = function (callBack) {
            this.onDiscovered = callBack;
            this.connect();
            // evothings.ble.connect(this.address, callBack,(err) => this.logError(err));  
        };
        return BleDevice;
    })();
    bleio.BleDevice = BleDevice;
    ///////////////////////////////////////////////// BLE Scanner Class///////////////////////////////////////////////////////////////
    var BleScanner = (function () {
        function BleScanner() {
            this.knownDevices = {};
            this.connectedDevices = {};
            this.reportOnce = false;
            this.name = 'EasyBle';
        }
        BleScanner.prototype.logError = function (err) {
            if (this.onError)
                this.onError(err);
            else
                console.log('ERROR BleConnect : ' + JSON.stringify(err));
        };
        BleScanner.prototype.onFail = function (result) {
            this.onError && this.onError(result);
            console.log(this.name, result);
        };
        BleScanner.prototype.stopScan = function (success) {
            var _this = this;
            evothings.ble.stopScan(success, function (result) { return _this.onFail(result); });
        };
        BleScanner.prototype.startScan = function (win) {
            var _this = this;
            this.stopScan(function () {
            });
            evothings.ble.startScan(win, function (err) { return _this.logError(err); });
        };
        return BleScanner;
    })();
    bleio.BleScanner = BleScanner;
})(bleio || (bleio = {}));
//# sourceMappingURL=bleio.js.map