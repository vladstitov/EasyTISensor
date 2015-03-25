/// <reference path="typings/jquery.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ti;
(function (ti) {
    var LibraryGages = (function () {
        function LibraryGages() {
            this.CONST = Reg.DEV;
        }
        LibraryGages.prototype.createView = function (service, view) {
            switch (service.name) {
                case Reg.IRTEMPERATURE:
                    return new TemperatureView(service, view);
                    break;
                case Reg.ACCELEROMETER:
                    return new AccelerometerView(service, view);
                    break;
                case Reg.HUMIDITY:
                    return new HumidityView(service, view);
                    break;
                case Reg.BAROMETER:
                    return new BarometerView(service, view);
                    break;
                case Reg.KEYPRESS:
                    return new KeyPressView(service, view);
                    break;
                case Reg.MAGNETOMETER:
                    return new MagnetometerView(service, view);
                    break;
                case Reg.GYROSCOPE:
                    return new GyroscopeView(service, view);
                    break;
                default:
                    return new Unknown(service, view);
                    break;
            }
        };
        return LibraryGages;
    })();
    ti.LibraryGages = LibraryGages;
    var ServiceView = (function () {
        function ServiceView(service, view) {
            this.service = service;
            this.header = view;
            this.view = view.parent();
            this.content = $('<div>').appendTo(this.view);
        }
        ServiceView.prototype.toggle = function () {
            if (this.isBusy)
                return;
            if (this.header.hasClass('active'))
                this.deactivate();
            else
                this.activate();
        };
        ServiceView.prototype.turnON = function () {
        };
        ServiceView.prototype.onOFF = function (res) {
        };
        ServiceView.prototype.turnOFF = function () {
        };
        ServiceView.prototype.activate = function () {
            this.isBusy = true;
            this.header.addClass('active');
            this.turnON();
            this.resetBusy();
        };
        ServiceView.prototype.deactivate = function () {
            this.isBusy = true;
            this.header.removeClass('active');
            this.turnOFF();
            this.resetBusy();
        };
        ServiceView.prototype.resetBusy = function () {
            var _this = this;
            if (this.isBusy)
                setTimeout(function () {
                    _this.isBusy = false;
                }, 1000);
        };
        return ServiceView;
    })();
    ti.ServiceView = ServiceView;
    var Unknown = (function (_super) {
        __extends(Unknown, _super);
        function Unknown() {
            _super.apply(this, arguments);
        }
        Unknown.prototype.onData = function (data) {
            var b = new Int8Array(data);
            var val = b[0];
            console.log(this.service.name + '   ' + val);
        };
        Unknown.prototype.turnON = function () {
        };
        Unknown.prototype.turnOFF = function () {
        };
        // activate() {
        // this.service.turnOn(function () { });
        // this.service.setCallBack((res) => this.onData(res));
        // }
        // deactivate() {
        // this.service.turnOFF((res) => this.onOFF(res));
        //}
        Unknown.prototype.onOFF = function (res) {
        };
        return Unknown;
    })(ServiceView);
    var KeyPressView = (function (_super) {
        __extends(KeyPressView, _super);
        function KeyPressView() {
            _super.apply(this, arguments);
        }
        KeyPressView.prototype.onData = function (data) {
            var b = new Int8Array(data);
            var val = b[0];
            this.data.push(val);
            this.content.text(this.data.join(', '));
            console.log(this.service.name + '   ' + val);
        };
        KeyPressView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        KeyPressView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        return KeyPressView;
    })(ServiceView);
    var TemperatureView = (function (_super) {
        __extends(TemperatureView, _super);
        function TemperatureView() {
            _super.apply(this, arguments);
        }
        TemperatureView.prototype.onData = function (data) {
            var S0 = 5.593E-14, a1 = 1.75E-3, a2 = -1.678E-5, b0 = -2.94E-5, b1 = -5.7E-7, b2 = 4.63E-9, c2 = 13.4, Tref = 298.15;
            var t = new Int16Array(data);
            var amb = t[1] / 128.0;
            var Vobj2 = t[0] * 0.00000015625;
            var Tdie = amb + 273.15;
            var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2));
            var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2);
            var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
            var val = Math.pow(Math.pow(Tdie, 4) + (fObj / S), 0.25) - 273.15;
            // console.log(this.service.name + '   ' +tObj);
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
        };
        TemperatureView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            this.service.config(new Uint8Array([1]), function () {
            });
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        TemperatureView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        TemperatureView.prototype.onOFF = function (res) {
        };
        return TemperatureView;
    })(ServiceView);
    var AccelerometerView = (function (_super) {
        __extends(AccelerometerView, _super);
        function AccelerometerView() {
            _super.apply(this, arguments);
        }
        AccelerometerView.prototype.onData = function (res) {
            var data = new Int8Array(res);
            var val;
            var x = data[0] / 16;
            var y;
            var z;
            switch (data.length) {
                case 1:
                    val = x;
                    break;
                case 2:
                    y = data[1] / 16;
                    val = Math.sqrt((x * x) + (y * y));
                    break;
                case 3:
                    y = data[1] / 16;
                    z = data[2] / 16;
                    val = Math.sqrt((x * x) + (y * y) + (z * z));
                    break;
            }
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
            //  console.log(this.service.name + '   ' +g);       
        };
        AccelerometerView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            this.service.config(new Uint8Array([1]), function () {
            });
            this.service.writeProperty('PERIOD', new Uint8Array([20]), function () {
            });
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        AccelerometerView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        AccelerometerView.prototype.onOFF = function (res) {
        };
        return AccelerometerView;
    })(ServiceView);
    var HumidityView = (function (_super) {
        __extends(HumidityView, _super);
        function HumidityView() {
            _super.apply(this, arguments);
        }
        HumidityView.prototype.onData = function (res) {
            var d = new Int16Array(res);
            var hum = d[1] - (d[1] % 4);
            var val = (-6.0 + 125.0 * (hum / 65535.0));
            // console.log(this.service.name + '   ' + val);
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
        };
        HumidityView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            this.header.addClass('active');
            this.service.config(new Uint8Array([1]), function () {
            });
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        HumidityView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        HumidityView.prototype.onOFF = function (res) {
        };
        return HumidityView;
    })(ServiceView);
    var BarometerView = (function (_super) {
        __extends(BarometerView, _super);
        function BarometerView() {
            _super.apply(this, arguments);
            this.CALIBRATE = 2;
            this.calibration = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0]);
        }
        BarometerView.prototype.onData = function (res) {
            var calibration = this.calibration;
            var d = new Int16Array(res), t_r = d[0], p_r = d[1], t_a = (100 * (calibration[0] * t_r / Math.pow(2, 8) + calibration[1] * Math.pow(2, 6))) / Math.pow(2, 16), S = calibration[2] + calibration[3] * t_r / Math.pow(2, 17) + ((calibration[4] * t_r / Math.pow(2, 15)) * t_r) / Math.pow(2, 19), O = calibration[5] * Math.pow(2, 14) + calibration[6] * t_r / Math.pow(2, 3) + ((calibration[7] * t_r / Math.pow(2, 15)) * t_r) / Math.pow(2, 4);
            var val = (S * p_r + O) / Math.pow(2, 14);
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
            // console.log(this.service.name+'   '+ val);
        };
        BarometerView.prototype.onCalibrationW = function (res) {
            var _this = this;
            this.service.readProperty('CALIBRATION', function (res) { return _this.onCalibrationR(res); });
        };
        BarometerView.prototype.onCalibrationR = function (res) {
            this.isCalibrated = true;
            this.calibration = new Uint16Array(res);
            this.activate();
        };
        BarometerView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            if (this.isCalibrated) {
                this.service.config(new Uint8Array([1]), function () {
                });
                this.service.turnOn(function () {
                });
                this.service.setCallBack(function (res) { return _this.onData(res); });
            }
            else {
                this.service.config(new Uint8Array([this.CALIBRATE]), function (res) { return _this.onCalibrationW(res); });
            }
        };
        BarometerView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        BarometerView.prototype.onOFF = function (res) {
        };
        return BarometerView;
    })(ServiceView);
    var MagnetometerView = (function (_super) {
        __extends(MagnetometerView, _super);
        function MagnetometerView() {
            _super.apply(this, arguments);
        }
        MagnetometerView.prototype.onData = function (res) {
            var m = new Int16Array(res);
            var k = (2000.0 / 65336.0);
            var val = (m[0]) * k, y = k * (m[1]), z = k * (m[2]);
            //  console.log(x);    
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
        };
        MagnetometerView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            this.service.config(new Uint8Array([1]), function () {
            });
            this.service.writeProperty('PERIOD', new Uint8Array([20]), function () {
            });
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        MagnetometerView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        MagnetometerView.prototype.onOFF = function (res) {
        };
        return MagnetometerView;
    })(ServiceView);
    var GyroscopeView = (function (_super) {
        __extends(GyroscopeView, _super);
        function GyroscopeView() {
            _super.apply(this, arguments);
        }
        GyroscopeView.prototype.onData = function (res) {
            var d = new Int8Array(res);
            // Calculate rotation, unit deg/s, range -250, +250
            var k = (500.0 / 65536.0);
            k = Math.round(k * 100) / 100;
            var val = k * (d[0]), x = k * (d[1]), z = k * (d[2]);
            // console.log(y);
            this.data.push(val.toPrecision(4));
            this.content.text(this.data.join(', '));
        };
        GyroscopeView.prototype.turnON = function () {
            var _this = this;
            this.data = [];
            var cfg = Reg.DEV.GAxis.XYZ; // 7
            // console.log(cfg);
            this.service.config(new Uint8Array([cfg]), function () {
            });
            //  this.service.writeCharacteristic(this.service.getCharacteristicsByName('PERIOD'), new Uint8Array([20]),(res) => this.onWrite(res));
            this.service.turnOn(function () {
            });
            this.service.setCallBack(function (res) { return _this.onData(res); });
        };
        GyroscopeView.prototype.turnOFF = function () {
            var _this = this;
            this.service.turnOFF(function (res) { return _this.onOFF(res); });
        };
        GyroscopeView.prototype.onOFF = function (res) {
        };
        return GyroscopeView;
    })(ServiceView);
    var Reg = (function () {
        function Reg() {
        }
        Reg.KEYPRESS = 'KEYPRESS';
        Reg.MAGNETOMETER = 'MAGNETOMETER';
        Reg.ACCELEROMETER = 'ACCELEROMETER';
        Reg.IRTEMPERATURE = 'IRTEMPERATURE';
        Reg.BAROMETER = 'BAROMETER';
        Reg.HUMIDITY = 'HUMIDITY';
        Reg.GYROSCOPE = 'GYROSCOPE';
        Reg.CONFIG = 'CONFIG';
        Reg.PERIOD = 'PERIOD';
        Reg.DATA = 'DATA';
        Reg.NOTIFICATION = 'NOTIFICATION';
        Reg.DEV = {
            "f000aa10-0451-4000-b000-000000000000": "ACCELEROMETER",
            "f000aa12-0451-4000-b000-000000000000": "CONFIG",
            "f000aa13-0451-4000-b000-000000000000": "PERIOD",
            "f000aa11-0451-4000-b000-000000000000": "DATA",
            "f000aa00-0451-4000-b000-000000000000": "IRTEMPERATURE",
            "f000aa02-0451-4000-b000-000000000000": "CONFIG",
            "f000aa01-0451-4000-b000-000000000000": "DATA",
            "f000aa20-0451-4000-b000-000000000000": "HUMIDITY",
            "f000aa22-0451-4000-b000-000000000000": "CONFIG",
            "f000aa21-0451-4000-b000-000000000000": "DATA",
            "f000aa30-0451-4000-b000-000000000000": "MAGNETOMETER",
            "f000aa32-0451-4000-b000-000000000000": "CONFIG",
            "f000aa33-0451-4000-b000-000000000000": "PERIOD",
            "f000aa31-0451-4000-b000-000000000000": "DATA",
            "f000aa40-0451-4000-b000-000000000000": "BAROMETER",
            "f000aa42-0451-4000-b000-000000000000": "CONFIG",
            "f000aa41-0451-4000-b000-000000000000": "DATA",
            "f000aa43-0451-4000-b000-000000000000": "CALIBRATION",
            "f000aa50-0451-4000-b000-000000000000": "GYROSCOPE",
            "f000aa52-0451-4000-b000-000000000000": "CONFIG",
            "f000aa53-0451-4000-b000-000000000000": "PERIOD",
            "f000aa51-0451-4000-b000-000000000000": "DATA",
            "0000ffe0-0000-1000-8000-00805f9b34fb": "KEYPRESS",
            "0000ffe1-0000-1000-8000-00805f9b34fb": "DATA",
            "f000aa60-0451-4000-b000-000000000000": "TEST",
            "f000aa61-0451-4000-b000-000000000000": "DATA",
            "f000aa62-0451-4000-b000-000000000000": "CONFIG",
            "f000ffc0-0451-4000-b000-000000000000": "OAD",
            "f000ffc1-0451-4000-b000-000000000000": "IDENTIFY",
            "f000ffc2-0451-4000-b000-000000000000": "BLOCK",
            "f000ccc0-0451-4000-b000-000000000000": "CONNECTION_CONTROL",
            "f000ccc1-0451-4000-b000-000000000000": "CONNECTION_PARAMS",
            "f000ccc2-0451-4000-b000-000000000000": "CONNECTION_REQUESTPARAMS",
            "f000ccc3-0451-4000-b000-000000000000": "CONNECTION_REQUESTDISCONNECT",
            "00002902-0000-1000-8000-00805f9b34fb": "NOTIFICATION",
            "1800": "GENERIC_ACCESS",
            "1801": "GENERIC_ATTRIBUTE",
            "2a05": "GENERIC_UNKNOWN",
            "180a": "DEVICE_INFORMATION",
            "ffe0": "SIMPLE_KEY",
            "f000aa6004514000b000000000000000": "TEST",
            "f000aa6204514000b000000000000000": "TEST_CONFIGURATION",
            "f000ffc004514000b000000000000000": "OAD",
            "2a00": "DEVICE_NAME",
            "2a01": "APPEARANCE",
            "2a02": "PERIPHERAL_PRIVACY_FLAG",
            "2a03": "RECONNECTION_ADDRESS",
            "2a04": "PERIPHERAL_PREFERRED_CONNECTION_PARAMETERS",
            "2a23": "SYSTEM_ID",
            "2a24": "MODEL_NUMBER",
            "2a25": "SERIAL_NUMBER",
            "2a26": "FIRMWARE_REVISION",
            "2a27": "HARDWARE_REVISION",
            "2a28": "SOFTWARE_REVISION",
            "2a29": "MANUFACTURER_NAME",
            "2a2a": "REGULATORY_CERTIFICATE_DATA_LIST",
            "2a50": "PNP_ID",
            "ffe1": "SIMPLE_KEY_DATA",
            "2902": "SUBSCRIBE",
            "2901": "DATA",
            GAxis: { X: 1, Y: 2, XY: 3, Z: 4, XZ: 5, YZ: 6, XYZ: 7 }
        };
        return Reg;
    })();
    ti.Reg = Reg;
})(ti || (ti = {}));
//# sourceMappingURL=tisensortag.js.map