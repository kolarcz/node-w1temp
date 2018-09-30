import fileExistsWait from './fileExistsWait';
import Sensor from './Sensor';
import { SENSOR_UID_REGEXP } from './constants';

export default function getSensor(
  sensorUid,
  enablePolling = true,
  interval = 250,
  onlyIfChanged = true
) {
  return new Promise((resolve, reject) => {
    if (!SENSOR_UID_REGEXP.test(sensorUid)) {
      reject(new Error('Bad sensor uid format'));
    } else if (typeof enablePolling !== 'boolean') {
      reject(new Error('enablePolling must be a boolean'));
    } else if (typeof interval !== 'number' || interval <= 0) {
      reject(new Error('interval must be a number and greater then 0'));
    } else if (typeof onlyIfChanged !== 'boolean') {
      reject(new Error('onlyIfChanged must be a boolean'));
    } else {
      const file = `/sys/bus/w1/devices/${sensorUid}/w1_slave`;

      fileExistsWait(file)
        .then(() => {
          const sensor = new Sensor(file, enablePolling, interval, onlyIfChanged);
          resolve(sensor);
        })
        .catch(() => {
          reject(new Error('Cant get sensor instance'));
        });
    }
  });
}
