import fs from 'fs';
import { EventEmitter } from 'events';

class Sensor extends EventEmitter {

  constructor(file, enablePolling = true, interval = 250, onlyIfChanged = true) {
    super();

    this.file = file;
    this.lastTemp = false;
    this.onlyIfChanged = onlyIfChanged;

    if (enablePolling) {
      setInterval(() => {
        const newTemp = this.getTemperature();

        if (!this.onlyIfChanged || this.lastTemp !== newTemp) {
          this.lastTemp = newTemp;
          this.emit('change', newTemp);
        }
      }, interval);
    }
  }

  getTemperature() {
    try {
      const data = fs.readFileSync(this.file, 'utf8');
      const match = data.match(/t=(-?\d+)/);

      if (data.indexOf('YES') !== -1 && match) {
        const temp = parseInt(match[1], 10) / 1000;
        return temp;
      }
    } catch (err) {}

    return false;
  }

  getTemperatureAsync() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.file, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const match = data.match(/t=(-?\d+)/);

        if (!match) {
          reject(new Error('Unable to parse sensor data'));
          return;
        }
        if (data.indexOf('YES') === -1) {
          reject(new Error('CRC mismatch'));
          return;
        }
        const temp = parseInt(match[1], 10) / 1000;
        resolve(temp);
      });
    });
  }

}

export default Sensor;
