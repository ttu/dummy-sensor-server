const chart = {
    c3Chart: c3.generate({
        bindto: '#graph',
        data: {
            x: 'x',
            columns: []
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%X'
                }
            }
        }
    }),
    MAX_DATA_POINTS: 20,
    columns: [['x']],
    handleChart: function (sensorData) {

        if (!this.columns.some(l => l[0] === sensorData.id))
            this.columns.push([sensorData.id]);

        this.appendTimeStamp(new Date(sensorData.timestamp));

        const colIndex = this.columns.map(c => c[0]).indexOf(sensorData.id);
        this.appendColumn(colIndex, sensorData.data);

        this.c3Chart.load({
            columns: this.columns
        });
    },
    appendTimeStamp: function (timeStamp) {
        timeStamp.setUTCMilliseconds(0);

        if (!this.columns[0].some(i => i !== 'x' && i.getTime() === timeStamp.getTime())) {
            this.columns[0].push(timeStamp);

            if (this.columns[0].length > this.MAX_DATA_POINTS) {
                this.columns[0].splice(1, 1);
            }
        }
    },
    appendColumn: function (index, temperature) {

        while (this.columns[0].length - 1 > this.columns[index].length) {
            this.columns[index].push(temperature);
        }

        this.columns[index].push(temperature);

        if (this.columns[index].length > this.MAX_DATA_POINTS) {
            this.columns[index].splice(1, 1);
        }
    },
    removeChartValues: function (sensorId) {

        // TODO: Fix unloading, reloading

        const colIndex = this.columns.map(c => c[0]).indexOf(sensorId);
        this.columns.splice(colIndex, 1);

        // this.columns[colIndex].splice(1, this.MAX_DATA_POINTS);

        this.c3Chart.unload({
            ids: sensorId
        });
    }
};