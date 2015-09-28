var FS = require("fs");
var GPIO = require("gpio");


function W1TempSensor(sensorUid) {
  this.sensorUid = sensorUid;
}

W1TempSensor.prototype = {

  getTemperature: function () {
    var file = this.getFilePath_(this.sensorUid);

    if (!FS.existsSync(file)) {
      return null;
    }

    var data = String(FS.readFileSync(file));
    extracted = this.extractData_(data);

    if (!extracted || extracted.crc !== 'YES') {
      return null;
    }

    return extracted.temperature;
  },

  getFilePath_: function (sensorUid) {
    return '/sys/bus/w1/devices/' + sensorUid + '/w1_slave';
  },

  extractData_: function (data) {
    var tmp = String(data).match(/^([0-9a-f]{2} )+: crc=[0-9a-f]+ ([a-z]+)\n([0-9a-f]{2} )+t=([0-9]+)$/mi);

    if (!tmp) {
      return false;
    }

    return {
      temperature: parseInt(tmp[4], 10) / 1000,
      crc: tmp[2]
    }
  }

};


var instances = {};

module.exports = {

  sensor: function (sensorUid) {
    if (typeof sensorUid !== 'string') {
      return null;
    }

    if (!instances[sensorUid]) {
      instances[sensorUid] = new W1TempSensor(sensorUid);
    }

    return instances[sensorUid];
  },

  gpioPower: function (gpioId) {
    var gpio = GPIO.export(gpioId, {
      direction: 'out',
      ready: function () {
        gpio.set(1);
      }
    });
  }

};
