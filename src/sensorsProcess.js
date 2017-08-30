'use strict';

const SensorModel = require('./sensorModel');

class SensorsProcess {
    constructor() {
        this.sensors = [];

        process.on('message', msg => {
            if (msg.func === 'add') {
                this.addSensor(msg.id, msg.settings);
            }
        });

        setInterval(() => {
            this.sensors.forEach(s => {
                process.send({ func: 'update', payload: s.toJson() });
            });
        }, 300);
    }

    addSensor(id, settings) {
        if (!this.sensors.some(s => s.id === id)) {
            const key = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(0, 5).toLocaleLowerCase();
            const newSensor = new SensorModel(id, key, settings);
            this.sensors.push(newSensor);
            process.send({ func: 'add', payload: newSensor.toJsonWithKey() });
        }
    }

    deleteSensor(id, key) {
        if (!this.sensors.some(s => s.id === id && s.key === key)) {
            this.sensors.delete(id);
            process.send({ func: 'delete', payload: id });
        }
    }
}

const sensorsProcess = new SensorsProcess(); // eslint-disable-line no-unused-vars