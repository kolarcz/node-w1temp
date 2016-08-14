import { exec } from 'child_process';

export default function setGpioData(gpioPin) {
  return new Promise((resolve, reject) => {
    if (typeof gpioPin !== 'number') {
      reject(new Error('Gpio pin is not a number'));
    } else {
      const commands = [
        'modprobe w1-gpio',
        'modprobe w1-therm',
        `dtoverlay w1-gpio gpiopin=${gpioPin}`
      ];

      exec(commands.join(' && '), (err) => {
        if (err) {
          reject(new Error('Could not set data gpio pin'));
        } else {
          resolve();
        }
      });
    }
  });
}
