# w1temp
Measure temperature through DS18B20 sensor connected to 1wire to Raspberry PI with `node.js`

## Instalation
`npm install w1temp`

## Dependencies
W1 configuration:

1. at the end of file /boot/config.txt add `dtoverlay=w1-gpio,gpiopin=<gpiopin>` where &lt;gpiopin&gt; is pin where is connected w1 data channel
2. run `modprobe w1-gpio && modprobe w1-therm` (it can be at cron too: `@reboot sudo modprobe w1-gpio && sudo modprobe w1-therm`)

## Methods

### W1Temp.gpioPower(*gpio pin number*)
Power on gpio pin if any is connected as w1 power and reset init time on existing sensor instances.

### W1Temp.sensor(*sensor uid* [, *init time in ms = 2000*])
Get sensor instance (sensor uid is located in /sys/bus/w1/devices/).

### &lt;sensor_instance&gt;.getTemperature([*callback(temp)*])
Return Promise which returns in then actual temperature in celsius or catch if fails. Or you can use callback (null if fails).

## Example
```javascript
var W1Temp = require('w1temp');

// power on gpio if any is connected as w1 power
W1Temp.gpioPower(13);

// instance of temperature sensor
var sensor = W1Temp.sensor('28-00000636a3e3');


// print actual temperature in celsius on sensor by promise
sensor.getTemperature().then(function (temp) {
  console.log(temp + ' °C');  
}).catch(function () {
  console.log('Cant read temperature');
});

// or as callback
sensor.getTemperature(function (temp) {
  console.log(temp + ' °C');  
});
```
