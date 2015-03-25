/// <reference path="typings/jquery.d.ts" />
/// <reference path="tisensortag.ts" />
/// <reference path="easyble.ts" />
var ti;
(function (ti) {
    var ScannerView = (function () {
        function ScannerView() {
            var _this = this;
            this.status = $('#status');
            this.btnScanner = $('#scan').data('state', 'scan').on(CLICK, function (evt) { return _this.onScanClick(evt); });
            this.scanner = new evoble.BleScanner();
        }
        ScannerView.prototype.onFoundDevice = function (device) {
            this.myDevice = device;
            this.status.text('Found ' + device.name);
            this.btnScanner.data('state', 'connect');
            this.btnScanner.text('Connect');
            this.scanner.stopScan();
        };
        ScannerView.prototype.onConnected = function (name) {
            this.status.text('Connected');
            this.btnScanner.data('state', 'connected');
            this.btnScanner.text('Disconnect');
            this.deviceView.populateServices($('<div>').appendTo($('#deviceView')));
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
                    this.scanner.reportDeviceOnce(true);
                    this.scanner.scanTime(2000);
                    this.scanner.startScan(function (device) { return _this.onDeviceFound(device); });
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
                    if (!this.deviceView)
                        this.deviceView = new DeviceView(this.myDevice, function (name) { return _this.onConnected(name); });
                    else
                        this.deviceView.reconnect();
                    break;
                case 'disconnect':
                    this.status.text('Disconnected');
                    this.btnScanner.data('state', 'connect');
                    this.btnScanner.text('Re-connect');
                    if (this.deviceView)
                        this.deviceView.disconnect();
                    break;
                case 'connected':
                    this.status.text('Disconnecting');
                    this.btnScanner.data('state', 'connect');
                    this.btnScanner.text('Re-connect');
                    if (this.deviceView)
                        this.deviceView.disconnect();
                    break;
            }
        };
        return ScannerView;
    })();
    ti.ScannerView = ScannerView;
    var DeviceView = (function () {
        function DeviceView(device, onConnected) {
            var _this = this;
            this.device = device;
            this.onConnected = onConnected;
            this.views = {};
            this.title = $('#title');
            this.library = new ti.LibraryGages();
            this.save = $('#save');
            this.device.discover(this.library.CONST, function () { return _this.onDiscovered(); });
        }
        DeviceView.prototype.onDiscovered = function () {
            this.onConnected && this.onConnected(this.device.name);
        };
        DeviceView.prototype.activateService = function (id) {
            if (isNaN(id))
                return;
            var serv = this.services[id];
        };
        DeviceView.prototype.deactivateService = function (id) {
            if (isNaN(id))
                return;
        };
        DeviceView.prototype.toggleActive = function (evt) {
            var el = $(evt.target);
            if (el.data('type') !== 'service')
                return;
            var name = el.data('name');
            if (!this.views[name])
                this.views[name] = this.library.createView(this.device.getServiceByName(name), el);
            this.views[name].toggle();
        };
        DeviceView.prototype.reconnect = function () {
        };
        DeviceView.prototype.disconnect = function () {
            this.device.disconnect();
        };
        DeviceView.prototype.populateServices = function (view) {
            var _this = this;
            this.title.text(this.device.name);
            view.addClass('services');
            var servs = this.device.getAllServices();
            this.services = servs;
            var out = '<ul>';
            for (var i = 0, n = servs.length; i < n; i++)
                out += this.renderSevice(i, servs[i]);
            view.html(out + '</ul>');
            view.on(CLICK, 'a.header', function (evt) { return _this.toggleActive(evt); });
            this.view = view;
        };
        DeviceView.prototype.renderSevice = function (id, ser) {
            return '<li class="service"><a class="header" href="#" data-type="service" data-uuid="' + ser.uuid + '"  data-id="' + id + '" data-name="' + ser.name + '">' + ser.name + '</a></li>';
        };
        DeviceView.prototype.onBarometer = function (res) {
            console.log('onBarometer ' + res);
        };
        DeviceView.prototype.onSaveClick = function (evt) {
        };
        DeviceView.prototype.onLinkClick = function (evt) {
        };
        return DeviceView;
    })();
    ti.DeviceView = DeviceView;
})(ti || (ti = {}));
//# sourceMappingURL=DeviceView.js.map