import fs from 'fs';
import { EventEmitter } from 'events';

class Sensor extends EventEmitter {

  constructor(file) {
    super();

    this.file = file;
    this.lastTemp = false;

    setInterval(() => {
      const newTemp = this.getTemperature();

      if (this.lastTemp !== newTemp) {
        this.lastTemp = newTemp;
        this.emit('change', newTemp);
      }
    }, 250);
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

}

export default Sensor;
