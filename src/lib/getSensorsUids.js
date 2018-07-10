import fs from 'fs';
import fileExistsWait from './fileExistsWait';
import { SENSOR_UID_REGEXP } from './constants';

export default function getSensorsUids(master_bus_id) {
  if (typeof master_bus_id != "number") {
    master_bus_id = 1;
  }
  return new Promise((resolve, reject) => {
    const file = '/sys/bus/w1/devices/w1_bus_master' +
      master_bus_id + '/w1_master_slaves';

    fileExistsWait(file)
      .then(() => {
        const data = fs.readFileSync(file, 'utf8');
        const list = data
          .split('\n')
          .filter((line) => SENSOR_UID_REGEXP.test(line));

        resolve(list);
      })
      .catch(() => {
        reject(new Error('Cant get list of sensors'));
      });
  });
}
