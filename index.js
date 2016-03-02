var FS = require("fs");
var GPIO = require("gpio");


var basePath = '/sys/bus/w1/devices/';

function getBasePath() {
  return basePath;
}

function getPathToSourceOfUid(uid) {
  return getBasePath() + uid + '/w1_slave';
}


function W1TempSensor(sensorUid, initTime) {
  this.sensorUid = sensorUid;
  this.initTime = initTime;
  this.resetInitTime_();
}

W1TempSensor.prototype = {

  resetInitTime_: function () {
    this.initializedFrom = +new Date() + this.initTime;
  },

  getTemperature: function (cb) {
    cb = typeof cb == 'function' ? cb : function(){};
    var file = getPathToSourceOfUid(this.sensorUid);

    var read = function (resolve, reject) {
      if (FS.existsSync(file)) {
        var data = String(FS.readFileSync(file));
        extracted = this.extractData_(data);

        if (extracted && extracted.crc == 'YES') {
          resolve(extracted.temperature);
          cb(extracted.temperature);
          return
        }
      }

      var waitTime = Math.max(0, this.initializedFrom - new Date());

      if (waitTime > 0) {
        setTimeout(
          read.bind(this, resolve, reject),
          Math.min(1000, waitTime)
        );
      } else {
        reject();
        cb({});
      }
    };

    return new Promise(read.bind(this));
  },

  getFahrenheitFromCelsius_: function (celsius) {
    return celsius * 9 / 5 + 32;
  },

  extractData_: function (data) {
    var tmp = String(data).match(/^([0-9a-f]{2} )+: crc=[0-9a-f]+ ([a-z]+)\n([0-9a-f]{2} )+t=([0-9]+)$/mi);

    if (!tmp) {
      return false;
    }

    var celsius = parseInt(tmp[4], 10) / 1000;
    var fahrenheit = this.getFahrenheitFromCelsius_(celsius);

    return {
      temperature: {
        celsius: celsius,
        fahrenheit: fahrenheit
      },
      crc: tmp[2]
    }
  }

};


var instances = {};

module.exports = {

  gpioPower: function (gpioId) {
    for (var sensorUid in instances) {
      instances[sensorUid].resetInitTime_();
    }

    var gpio = GPIO.export(gpioId, {
      direction: 'out',
      ready: function () {
        gpio.set(1);
      }
    });
  },

  sensorsUids: function () {
    var items = FS.readdirSync(getBasePath());
    var uids = items.filter(function (item) {
      return FS.existsSync(getPathToSourceOfUid(item));
    });

    return uids;
  },

  sensor: function (sensorUid, initTimeInMs) {
    if (typeof sensorUid !== 'string') {
      return null;
    }

    if (!instances[sensorUid]) {
      var initTime = arguments.length > 1 ? initTimeInMs : 15000;
      instances[sensorUid] = new W1TempSensor(sensorUid, initTime);
    }

    return instances[sensorUid];
  }

};
