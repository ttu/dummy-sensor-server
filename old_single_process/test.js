'use strict';

const assert = require('chai').assert;
const SensorModel = require('./sensorModel');
const Sensors = require('./sensors');

describe('Sensors', function () {

    describe('Get temp', () => {
        it('should be 25', () => {
            const s = new SensorModel('asd');
            const originalValue = s.getData();
            assert.isTrue(originalValue > 24);
        });

        it('should not be 25', done => {
            const s = new SensorModel('asd');
            const originalValue = s.getData();
            // Wait 1 sec to get new temp
            setTimeout(() => {
                const newValue = s.getData();
                assert.notEqual(originalValue, newValue);
                // console.log(`New value: ${newValue}`);
                done();
            }, 1000);
        });
    });

    describe('Get sensors', () => {
        it('should have 5 sensors', () => {
            const sensors = new Sensors();            
            sensors.addSensor();
            sensors.addSensor(undefined);
            sensors.addSensor(undefined);
            sensors.addSensor('ABA');
            sensors.addSensor('ABA');
            sensors.addSensor('ABA2');

            assert.equal(5, sensors.getSensorsIds().length);
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
            assert.isNull(sensorData);
        });

        it('should listen', () => {
            const sensors = new Sensors(() => {}); 
            sensors.addSensor('ABA');

            let found = sensors.listenSensor('1', 'ABA');
            assert.isTrue(found);

            found = sensors.stopListenSensor('1', 'ABA2');
            assert.isFalse(found);

            found = sensors.stopListenSensor('1', 'ABA');
            assert.isTrue(found);

            const notFound = sensors.listenSensor('1', 'ACDC');
            assert.isFalse(notFound);

            found = sensors.listenSensor('1', 'ABA56');
            found = sensors.listenSensor('1', 'ABA65');
            sensors.stopListenSensorAll('1');
        });

        it('should get listen data', (done) => {
            const toListen = "A234";
            const sensors = new Sensors((data) => {
                assert.equal(toListen, data.id);
                done();
            }); 
            sensors.addSensor(toListen);
            const found = sensors.listenSensor('1', toListen);
            assert.isTrue(found);
        });
    });
});