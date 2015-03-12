module ti {
    export class SensorTag {
        device: evoble.BleDevice;
        constructor(private ble: evoble.BleConnect) {
           
        }

        disconnectDevice() {
            if (this.device) {
                this.device.close();
                this.device = null;
            }
        }
        private onDeviceFound(device: evoble.BleDevice): void {
            if(
        }
        connectToDevice() {
            this.disconnectDevice();          
            this.ble.reportDeviceOnce(true);
            this.ble.scanTime(2000);
            this.ble.startScan((device) => this.onDeviceFound(device),(res) => this.onFail(res));
        }

        private onFail(res): void {

        }



        private CONSTS: any = {
        "f000aa10-0451-4000-b000-000000000000": "ACCELEROMETER_SERVICE",
        "f000aa12-0451-4000-b000-000000000000": "ACCELEROMETER_CONFIG",
        "f000aa13-0451-4000-b000-000000000000": "ACCELEROMETER_PERIOD",
        "f000aa11-0451-4000-b000-000000000000": "ACCELEROMETER_DATA",
        "f000aa00-0451-4000-b000-000000000000": "IRTEMPERATURE_SERVICE",
        "f000aa02-0451-4000-b000-000000000000": "IRTEMPERATURE_CONFIG",
        "f000aa01-0451-4000-b000-000000000000": "IRTEMPERATURE_DATA",
        "f000aa20-0451-4000-b000-000000000000": "HUMIDITY_SERVICE",
        "f000aa22-0451-4000-b000-000000000000": "HUMIDITY_CONFIG",
        "f000aa21-0451-4000-b000-000000000000": "HUMIDITY_DATA",
        "f000aa30-0451-4000-b000-000000000000": "MAGNETOMETER_SERVICE",
        "f000aa32-0451-4000-b000-000000000000": "MAGNETOMETER_CONFIG",
        "f000aa33-0451-4000-b000-000000000000": "MAGNETOMETER_PERIOD",
        "f000aa31-0451-4000-b000-000000000000": "MAGNETOMETER_DATA",
        "f000aa40-0451-4000-b000-000000000000": "BAROMETER_SERVICE",
        "f000aa42-0451-4000-b000-000000000000": "BAROMETER_CONFIG",
        "f000aa41-0451-4000-b000-000000000000": "BAROMETER_DATA",
        "f000aa43-0451-4000-b000-000000000000": "BAROMETER_CALIBRATION",
        "f000aa50-0451-4000-b000-000000000000": "GYROSCOPE_SERVICE",
        "f000aa52-0451-4000-b000-000000000000": "GYROSCOPE_CONFIG",
        "f000aa53-0451-4000-b000-000000000000": "GYROSCOPE_PERIOD",
        "f000aa51-0451-4000-b000-000000000000": "GYROSCOPE_DATA",
        "0000ffe0-0000-1000-8000-00805f9b34fb": "KEYPRESS_SERVICE",
        "0000ffe1-0000-1000-8000-00805f9b34fb": "KEYPRESS_DATA",
        "f000aa60-0451-4000-b000-000000000000": "TEST_SERVICS",
        "f000aa61-0451-4000-b000-000000000000": "TEST_DATA",
        "f000aa62-0451-4000-b000-000000000000": "TEST_CONFIG",
        "f000ffc0-0451-4000-b000-000000000000": "OAD_SERVICE",
        "f000ffc1-0451-4000-b000-000000000000": "OAD_IDENTIFY",
        "f000ffc2-0451-4000-b000-000000000000": "OAD_BLOCK",
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
        "2901": "DATA"
    }
    }
}

