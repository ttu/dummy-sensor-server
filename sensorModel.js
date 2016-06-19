'use strict';

//const data = { id: 'XXX', timestamp: '12-12-12', data: 25};

class SensorModel {
    constructor(id, key) {
        this.myId = id;
        this.timestamp = Date.now();
        this.data = 25;
        this.myKey = key;
    }

    get id() { return this.myId; }
    get key() { return this.myKey; }

    // Update value of data up or down max 0.02 degrees for every 100ms
    countNewValue(data, time, newTime) {
        let diff = newTime - time;
        let maxLoops = 10; // Lets not try to kill this, so X amount data changes is enough to randomize
        while (diff > 99 || maxLoops > 0) {
            var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
            data += Math.random() * 0.02 * plusOrMinus;
            diff -= 100;
            maxLoops -= 1;
        }

        return data
    }

    updateData() {
        const newTime = Date.now();
        this.data = this.countNewValue(this.data, this.timestamp, newTime);
        this.timestamp = newTime;
        return this.data;
    }

    toJson() {
        this.updateData();
        return {
            id: this.myId,
            data: this.data,
            timestamp: this.timestamp
        }
    }

    // TODO: Key can be used to delete sensors
    toJsonWithKey() {
        this.updateData();
        return {
            id: this.myId,
            data: this.temp,
            timestamp: this.timestamp,
            key: this.myKey
        }
    }
}

module.exports = SensorModel;