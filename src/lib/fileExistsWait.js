import fs from 'fs';

export default function fileExistsWait(file, maxMsWait = 20000) {
  return new Promise((resolve, reject) => {
    const endTime = +new Date() + maxMsWait;

    const check = () => {
      fs.stat(file, (err, stats) => {
        if (stats && stats.isFile()) {
          resolve();
        } else if (err && err.code === 'ENOENT' && endTime > +new Date()) {
          setTimeout(check, 1000);
        } else {
          reject();
        }
      });
    };

    check();
  });
}
