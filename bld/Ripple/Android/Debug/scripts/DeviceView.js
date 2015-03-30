/// <reference path="typings/jquery.d.ts" />
/// <reference path="tisensortag.ts" />
/// <reference path="bleio.ts" />
var bleio;
(function (bleio) {
    var ScannerView = (function () {
        function ScannerView() {
            var _this = this;
            this.status = $('#status');
            this.btnScanner = $('#scan').data('state', 'scan').on(CLICK, function (evt) { return _this.onScanClick(evt); });
            this.scanner = new bleio.BleScanner();
            this.clear();
        }
        ScannerView.prototype.clear = function () {
            this.knownDevices = {};
        };
        ScannerView.prototype.onFoundDevice = function (device) {
            var existingDevice = this.knownDevices[device.address];
            if (existingDevice) {
                existingDevice.rssi = device.rssi;
            }
            else {
                if (device && device.name) {
                    var dev = new bleio.BleDevice(device.address, device.rssi, device.name);
                    this.knownDevices[device.address] = dev;
                    this.status.text('Found ' + device.name);
                    this.device = dev;
                    this.deviceView = null;
                    this.scanner.stopScan();
                    this.onFound(dev);
                }
            }
        };
        ScannerView.prototype.onDeviceFound = function (device) {
            if ((device != null) && (device.name != null))
                this.onFoundDevice(device);
        };
        ScannerView.prototype.onScanClick = function (evt) {
            var _this = this;
            var el = $(evt.currentTarget);
            switch (el.data('state')) {
                case 'scan':
                    el.data('state', 'scanning');
                    this.status.text('Scanning...');
                    this.btnScanner.text('Stop Scan');
                    this.scanner.stopScan();
                    this.scanner.startScan(function (device) { return _this.onDeviceFound(device); });
                    break;
                case 'scanning':
                    this.status.text('Scan');
                    this.btnScanner.data('state', 'scan');
                    this.btnScanner.text('Scan');
                    this.scanner.stopScan();
                    break;
            }
        };
        return ScannerView;
    })();
    bleio.ScannerView = ScannerView;
    var DeviceView = (function () {
        function DeviceView(device, view) {
            var _this = this;
            this.device = device;
            this.view = view;
            this.views = {};
            this.title = $('<h2>').text(device.address).appendTo(view);
            this.status = $('<h3>').text('found').appendTo(view);
            this.btnConnect = $('<a>').data('state', 'connect').on(CLICK, function (evt) { return _this.onConnectClick(evt); }).appendTo(view);
            this.library = new bleio.LibraryGages();
            // this.save = $('#save');
        }
        DeviceView.prototype.getDevice = function () {
            return this.device;
        };
        DeviceView.prototype.onConnectClick = function (evt) {
            var _this = this;
            var el = $(evt.currentTarget);
            if (!this.device)
                return;
            switch (el.data('state')) {
                case 'connect':
                    if (this.device)
                        this.device.reconnect();
                    else
                        this.device.discover(this.library.CONST, function () { return _this.populateServices(); });
                    this.status.text('connecting...');
                    this.btnConnect.data('state', 'disconnect');
                    this.btnConnect.text('Disconnect');
                    break;
                case 'disconnect':
                    this.status.text('Disconnected');
                    this.btnConnect.data('state', 'connect');
                    this.btnConnect.text('Re-connect');
                    if (this.device)
                        this.device.disconnect();
                    break;
            }
        };
        // private activateService(id: number): void {
        // if (isNaN(id)) return
        //var serv: bleio.BleService = this.services[id];
        // }
        // private deactivateService(id: number): void {
        //  if (isNaN(id)) return
        // }
        DeviceView.prototype.toggleActive = function (evt) {
            var el = $(evt.target);
            if (el.data('type') !== 'service')
                return;
            var name = el.data('name');
            // console.log(name)    
            if (!this.views[name])
                this.views[name] = this.library.createView(this.device.getServiceByName(name), el);
            this.views[name].toggle();
        };
        DeviceView.prototype.reconnect = function () {
        };
        DeviceView.prototype.disconnect = function () {
            this.device.disconnect();
        };
        DeviceView.prototype.populateServices = function () {
            var _this = this;
            this.status.text('Connected');
            var view = this.view;
            this.title.text(this.device.name);
            view.addClass('services');
            var servs = this.device.getAllServices();
            this.services = servs;
            var out = '<ul>';
            for (var i = 0, n = servs.length; i < n; i++)
                out += this.renderSevice(i, servs[i]);
            view.html(out + '</ul>');
            view.on(CLICK, 'a.header', function (evt) { return _this.toggleActive(evt); });
        };
        DeviceView.prototype.renderSevice = function (id, ser) {
            return '<li class="service"><a class="header" href="#" data-type="service" data-uuid="' + ser.uuid + '"  data-id="' + id + '" data-name="' + ser.name + '">' + ser.name + '</a></li>';
        };
        // private onBarometer(res): void {
        // console.log('onBarometer ' + res);
        // }
        DeviceView.prototype.onSaveClick = function (evt) {
        };
        DeviceView.prototype.onLinkClick = function (evt) {
        };
        return DeviceView;
    })();
    bleio.DeviceView = DeviceView;
})(bleio || (bleio = {}));
//# sourceMappingURL=DeviceView.js.map