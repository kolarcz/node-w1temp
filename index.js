var FS = require("fs");
var GPIO = require("gpio");


function W1TempSensor(sensorUid, initTime) {
  this.sensorUid = sensorUid;
  this.initTime = initTime;
  this.resetInitTime_();
}

W1TempSensor.prototype = {

  resetInitTime_: function () {
    this.initializedFrom = new Date() + this.initTime;
  },

  getTemperature: function (cb) {
    cb = typeof cb == 'function' ? cb : function(){};
    var waitTime = Math.max(0, this.initializedFrom - new Date());
    var this_ = this;

    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        var file = this_.getFilePath_(this_.sensorUid);

        if (!FS.existsSync(file)) {
          reject();
          cb(null);
        } else {
          var data = String(FS.readFileSync(file));
          extracted = this_.extractData_(data);

          if (!extracted || extracted.crc !== 'YES') {
            reject();
            cb(null);
          } else {
            resolve(extracted.temperature);
            cb(extracted.temperature);
          }
        }
      }, waitTime);
    });
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

  sensor: function (sensorUid, initTimeInMs) {
    if (typeof sensorUid !== 'string') {
      return null;
    }

    if (!instances[sensorUid]) {
      var initTime = arguments.length > 1 ? initTimeInMs : 2000;
      instances[sensorUid] = new W1TempSensor(sensorUid, initTime);
    }

    return instances[sensorUid];
  },

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
  }

};
