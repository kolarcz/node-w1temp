# w1temp
Measure temperature through DS18B20 sensor connected to 1wire to Raspberry PI with `node.js`

## Instalation
`npm install w1temp`

## Dependencies
W1 configuration:

1. at the end of file /boot/config.txt add `dtoverlay=w1-gpio,gpiopin=<gpiopin>` where &lt;gpiopin&gt; is pin where is connected w1 data channel
2. run `modprobe w1-gpio && modprobe w1-therm` (it can be at cron too: `@reboot sudo modprobe w1-gpio && sudo modprobe w1-therm`)

## Methods

### W1Temp.setGpioPower(*gpioPinNumber*)
Turn on any gpio pin as W1 power.

### W1Temp.setGpioData(*gpioPinNumber*)
Set any gpio pin to use as W1 data channel (required root permissions).

### W1Temp.getSensorsUids()
Return Promise which returns list of available sensors uids, catch if fails.

### W1Temp.getSensor(*sensorUid*)
Return Promise which returns sensor instance, catch if fails.

### &lt;sensor_instance&gt;.getTemperature()
Returns actual temperature on sensor.

### &lt;sensor_instance&gt;.on('change', *callback(temp)*)
Event on change temperature.

## Example
```javascript
var W1Temp = require('w1temp');

// turn on gpio pin 13 as W1 power if you want to
W1Temp.setGpioPower(13);

// set gpio pin 6 to use as W1 data channel
// if is not set by instructions above (required root permissions)
W1Temp.setGpioData(6);

// print list of available sensors uids (ex.: [ '28-00000636a3e3' ])
W1Temp.getSensorsUids().then(function (sensorsUids) {
  console.log(sensorsUids);
});

// get instance of temperature sensor
W1Temp.getSensor('28-00000636a3e3').then(function (sensor) {

  // print actual temperature
  var temp = sensor.getTemperature();
  console.log('Actual temp:', temp, '°C');

  // print actual temperature on changed
  sensor.on('change', function (temp) {
    console.log('Temp changed:', temp, '°C');
  });

});
```
