# EasyTISensor
Easy ble TiSensor

For quick start with Texas Instruments Sensor Tag CC2541 SensorTag Development Kit is the first Bluetooth Smart development kit focused on wireless sensor applications 
http://www.ti.com/tool/cc2541dk-sensor

My tag contains 6 sensors and 2 button keys:
IR temperature
Accelerometer
Humidity
Barometer
Magnetometer
Gyroscope
Buttons

You can get it from website for $25. was delivered in 2 days;

Project was developed in VS 2013 Comunity 

As Device I used my Samsung S3 phone with Android 4.4.2

Connection to phone with Cordova and evothings.ble plugin


Project
Conatains 4 files:
index.ts  Imitializing BLE Scanner and creates view when divice found. If you want another device click Scan again

DeviceView.ts contains ScannerView and DeviceView

TISensorTag.ts contains LibraryGages (ititialize Sensor view according name) For each view data parser different depends on sensor name

Bleio.ts as a proxy between Views and evothings.ble 


