'use strict';

const SensorModel = require('./sensorModel');

class Sensors {
    constructor(updateFunc) {
        this.sensors = [];
        this.listeners = [];
        this.running = false;
        this.updateFunc = updateFunc;
    }

    addSensor(id) {
        id = id != undefined ? id : (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(0, 5).toLocaleLowerCase();

        if (!this.sensors.some(s => s.id === id)) {
            const newSensor = new SensorModel(id);
            this.sensors.push(newSensor);
            return newSensor.toJson();
        }

        return null;
    }

    getSensorsIds() {
        return this.sensors.map(s => s.id);
    }

    getSensorJson(id) {
        const selected = this.sensors.filter(s => s.id === id);
        return selected.length > 0 ? selected[0].toJson() : null;
    }

    listenSensor(clientId, sensorId) {
        if (this.listeners.some(s => s.client === clientId && s.sensor === sensorId))
            return true;

        var sensor = this.sensors.filter(s => s.id === sensorId);
        if (sensor.length > 0) {
            var newListener = { client: clientId, sensor: sensorId };
            this.listeners.push(newListener);
            sensor[0].isActive = true;
            this.execute();
            this.running = true;
            return true;
        }

        return false;
    }

    stopListenSensor(clientId, sensorId) {
        var sensor = this.listeners.filter(s => s.client === clientId && s.sensor === sensorId);
        if (sensor.length > 0) {
            this.listeners.pop(sensor[0]);
            if (!this.listeners.some(l => l.sensor === sensorId)) {
                sensor[0].isActive = false;
            }
            return true;
        }

        return false;
    }

    stopListenSensorAll(clientId) {
        var sensors = this.listeners.filter(s => s.client === clientId);
        sensors.forEach(s => {
            this.listeners.pop(sensors);
            if (!this.listeners.some(l => l.sensor === s.sensor)) {
                sensors[0].isActive = false;
            }
        });
    }

    // TODO: Add these updates to own process and this process only returns lates data
    execute() {
        if (this.running)
            return;

        setInterval(() => {
            const actives = this.sensors.filter(s => s.isActive);
            actives.forEach(a => {
                this.updateFunc(a.toJson());
            });
        }, 300);
    }
}

module.exports = Sensors;