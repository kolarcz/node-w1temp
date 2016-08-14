import gpio from 'gpio';

export default function setGpioPower(gpioPin) {
  return new Promise((resolve, reject) => {
    const pin = gpio.export(gpioPin, {
      direction: 'out',
      ready: (err) => {
        if (err) {
          reject(new Error('Could not set power gpio pin'));
        } else {
          pin.set(1, resolve);
        }
      }
    });
  });
}
