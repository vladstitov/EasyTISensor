/*https://github.com/evothings/cordova-ble/blob/master/ble.js */

declare module evothings.ble {
    function startScan(success: Function, fail: Function): void;//exec(win, fail, 'BLE', 'startScan', []);
    function stopScan(success: Function, fail: Function): void;//exec(null, null, 'BLE', 'stopScan', []);
    function connect(address, success: Function, fail: Function):void//  exec(win, fail, 'BLE', 'connect', [address]);
    export enum connectionState {
        STATE_DISCONNECTED,
        STATE_CONNECTING,
        STATE_CONNECTED,
        STATE_DISCONNECTING
    }

    function close (deviceHandle):void//exec(null, null, 'BLE', 'close', [deviceHandle]);
    function rssi(deviceHandle, success: Function, fail: Function):void// exec(win, fail, 'BLE', 'rssi', [deviceHandle]);
    function services(deviceHandle, success, fail):void// exec(win, fail, 'BLE', 'services', [deviceHandle]);
    export enum serviceType {
	SERVICE_TYPE_PRIMARY,
	SERVICE_TYPE_SECONDARY
    }

    function characteristics(deviceHandle, serviceHandle, win, fail): void// exec(win, fail, 'BLE', 'characteristics', [deviceHandle, serviceHandle]);

    export enum permission  {
        PERMISSION_READ,
        PERMISSION_READ_ENCRYPTED,
        PERMISSION_READ_ENCRYPTED_MITM,
        PERMISSION_WRITE,
        PERMISSION_WRITE_ENCRYPTED,
        PERMISSION_WRITE_ENCRYPTED_MITM,
        PERMISSION_WRITE_SIGNED,
        PERMISSION_WRITE_SIGNED_MITM
    }
    export enum property {
        PROPERTY_BROADCAST,
        PROPERTY_READ,
        PROPERTY_WRITE_NO_RESPONSE,
        PROPERTY_WRITE,
        PROPERTY_NOTIFY,
        PROPERTY_INDICATE,
        PROPERTY_SIGNED_WRITE,
        PROPERTY_EXTENDED_PROPS
    }
    export enum writeType {
	    WRITE_TYPE_NO_RESPONSE,
	    WRITE_TYPE_DEFAULT,
	    WRITE_TYPE_SIGNED
    }


    function descriptors(deviceHandle, characteristicHandle, success, fail):void//  exec(win, fail, 'BLE', 'descriptors', [deviceHandle, characteristicHandle]);
    function readCharacteristic(deviceHandle, characteristicHandle, success, fail): void// exec(win, fail, 'BLE', 'readCharacteristic', [deviceHandle, characteristicHandle]);
    function readDescriptor(deviceHandle, descriptorHandle, success, fail):void//exec(win, fail, 'BLE', 'readDescriptor', [deviceHandle, descriptorHandle]);
    function writeCharacteristic(deviceHandle, characteristicHandle, data, win, fail):void// exec(win, fail, 'BLE', 'writeCharacteristic', [deviceHandle, characteristicHandle, data.buffer]);
    function writeDescriptor(deviceHandle, descriptorHandle, data, win, fail):void// exec(win, fail, 'BLE', 'writeDescriptor', [deviceHandle, descriptorHandle, data.buffer]);
    function enableNotification(deviceHandle, characteristicHandle, win, fail):void// exec(win, fail, 'BLE', 'enableNotification', [deviceHandle, characteristicHandle]);
    function disableNotification(deviceHandle, characteristicHandle, win, fail):void//  exec(win, fail, 'BLE', 'disableNotification', [deviceHandle, characteristicHandle]);
    function testCharConversion (i, win):void// exec(win, null, 'BLE', 'testCharConversion', [i]);
    function reset(win, fail):void// exec(win, fail, 'BLE', 'reset', []);
    function fromUtf8(a: number[]): string//        return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(a))));

    function toUtf8(s:string):number[]
    function readAllServiceData(deviceHandle, win, fail):void 
    

}