'use strict';

//const data = { id: 'XXX', time: '12-12-12', temp: 25};

class SensorModel {
    constructor(id) {
        this.myId = id;
        this.time = Date.now();
        this.temp = 25;
        this.active = false;
    }

    get id() { return this.myId; }
    get isActive() { return this.active; }
    set isActive(value) { this.active = value; }

    // Update value of temp up or down max 0.02 degrees for every 100ms
    countNewValue(temp, time, newTime) {
        let diff = newTime - time;
        let maxLoops = 10; // Lets not try to kill this, so X amount temp changes is enough to randomize
        while (diff > 99 || maxLoops > 0) {
            var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
            temp += Math.random() * 0.02 * plusOrMinus;
            diff -= 100;
            maxLoops -= 1;
        }

        return temp
    }

    getData() {
        const newTime = Date.now();
        this.temp = this.countNewValue(this.temp, this.time, newTime);
        this.time = newTime;
        return this.temp;
    }

    toJson() {
        return {
            id: this.myId,
            temp: this.getData()
        }
    }
}

module.exports = SensorModel;