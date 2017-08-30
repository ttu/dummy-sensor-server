'use strict';

const assert = require('chai').assert;
const SensorModel = require('../src/sensorModel');
const Sensors = require('../src/sensors');

const settings = { initial: 25, min: 18, max: 30, updateValue: 0.002 };

describe('Get temp', () => {
    it('should be 25', () => {
        const s = new SensorModel('asd', 'A', settings);
        const originalValue = s.updateData();
        assert.isTrue(originalValue > 24);
    });

    it('should not be 25', done => {
        const s = new SensorModel('asd', 'B', settings);
        const originalValue = s.updateData();
        // Wait 1 sec to get new temp
        setTimeout(() => {
            const newValue = s.updateData();
            assert.notEqual(originalValue, newValue);
            // console.log(`New value: ${newValue}`);
            done();
        }, 1000);
    });
});

describe('Sensors', () => {
    it('should have 5 sensors', (done) => {
        const sensors = new Sensors();
        sensors.addSensor();
        sensors.addSensor(undefined);
        sensors.addSensor(undefined);
        sensors.addSensor('ABA');
        sensors.addSensor('ABA');
        sensors.addSensor('ABA2');

        // Wait that we get messages from other process
        setTimeout(() => {
            assert.equal(sensors.getSensorsIds().length, 5);
            done();
        }, 500);
    });

    it('should not be null', () => {
        const sensors = new Sensors();
        sensors.addSensor('A2');
        const sensorData = sensors.getSensorJson('A2');
        assert.isNotNull(sensorData);
    });

    it('should be null', () => {
        const sensors = new Sensors();
        const sensorData = sensors.getSensorJson('A3');
        assert.isUndefined(sensorData);
    });

    // it('should listen', (done) => {
    //     const sensors = new Sensors(() => { });
    //     sensors.addSensor('ABA').then(() => {

    //         let found = sensors.listenSensor('1', 'ABA');
    //         assert.isTrue(found);

    //         found = sensors.stopListenSensor('1', 'ABA2');
    //         assert.isFalse(found);

    //         found = sensors.stopListenSensor('1', 'ABA');
    //         assert.isTrue(found);

    //         const notFound = sensors.listenSensor('1', 'ACDC');
    //         assert.isFalse(notFound);

    //         found = sensors.listenSensor('1', 'ABA56');
    //         found = sensors.listenSensor('1', 'ABA65');
    //         sensors.stopListenSensorAll('1');
    //         done();
    //     });
    // });

    // it('should get listen data', (done) => {
    //     const toListen = "A234";
    //     const sensors = new Sensors((data) => {
    //         assert.equal(toListen, data.id);
    //         done();
    //     });
    //     sensors.addSensor(toListen).then(() => {
    //         const found = sensors.listenSensor('1', toListen);
    //         assert.isTrue(found);
    //     });
    // });
});