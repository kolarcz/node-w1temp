declare module 'w1temp' {
    import { EventEmitter } from 'events';

    export class Sensor extends EventEmitter {
        constructor(file: string, enablePolling?: boolean);
        getTemperature(): number;
        getTemperatureAsync(): Promise<number>;
    }

    export function getSensor(sensorUid: string, enablePolling?: boolean): Promise<Sensor>;

    export function getSensorsUids(masterBusId?: number): Promise<string[]>;

    export function setGpioData(gpioPinNumber: number): Promise<void>;

    export function setGpioPower(gpioPinNumber: number): Promise<void>;
}
