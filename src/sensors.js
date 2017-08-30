'use strict';

const child_process = require('child_process');

class Sensors {
    constructor(updateFunc) {
        this.sensors = new Map();
        this.listeners = [];
        this.updateFunc = updateFunc;
        this.waitList = new Map();

        this.worker_process = child_process.fork(__dirname + '/sensorsProcess.js');

        this.worker_process.on('message', msg => {
            if (msg.func === 'update') {
                this.sensors.set(msg.payload.id, msg.payload);
                if (this.listeners.some(s => s.sensor === msg.payload.id))
                    updateFunc(msg.payload);
            } else if (msg.func === 'add') {
                this.waitList.set(msg.payload.id, msg.payload)
            }
        });
    }

    addSensor(id, settings = { initial: 24, min: 18, max: 30, updateValue: 0.002 }) {
        id = id !== undefined ? id : (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(0, 5).toLocaleLowerCase();

        return new Promise((resolve, reject) => {
            this.worker_process.send({ func: 'add', id: id, settings: settings });

            const waitTime = 500;
            let maxWait = 2000;
            const runningInterval = setInterval(() => {
                console.log(`Adding ${id}`);
                if (this.waitList.has(id)) {
                    clearInterval(runningInterval);
                    var newSensor = this.waitList.get(id);
                    this.waitList.delete(id);
                    resolve(newSensor);
                }

                if ((maxWait -= waitTime) < 0) {
                    clearInterval(runningInterval);
                    reject(id);
                }
            }, waitTime);
        });
    }

    getSensorsIds() {
        return Array.from(this.sensors.keys());
    }

    getSensorJson(id) {
        return this.sensors.get(id);
    }

    listenSensor(clientId, sensorId) {
        if (this.listeners.some(s => s.client === clientId && s.sensor === sensorId))
            return true;

        var sensor = this.sensors.get(sensorId);
        if (sensor !== undefined) {
            var newListener = { client: clientId, sensor: sensorId };
            this.listeners.push(newListener);
            return true;
        }

        return false;
    }

    stopListenSensor(clientId, sensorId) {
        var sensor = this.listeners.filter(s => s.client === clientId && s.sensor === sensorId);
        if (sensor.length > 0) {
            this.listeners.pop(sensor[0]);
            return true;
        }

        return false;
    }

    stopListenSensorAll(clientId) {
        var sensors = this.listeners.filter(s => s.client === clientId);
        sensors.forEach(s => {
            this.listeners.pop(s);
        });
    }
}

module.exports = Sensors;