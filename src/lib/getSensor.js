import fileExistsWait from './fileExistsWait';
import Sensor from './Sensor';
import { SENSOR_UID_REGEXP } from './constants';

export default function getSensor(sensorUid) {
  return new Promise((resolve, reject) => {
    if (!SENSOR_UID_REGEXP.test(sensorUid)) {
      reject(new Error('Bad sensor uid format'));
    } else {
      const file = `/sys/bus/w1/devices/${sensorUid}/w1_slave`;

      fileExistsWait(file)
        .then(() => {
          const sensor = new Sensor(file);
          resolve(sensor);
        })
        .catch(() => {
          reject(new Error('Cant get sensor instance'));
        });
    }
  });
}
