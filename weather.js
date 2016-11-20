'use strict';

const request = require('superagent');

class DataWrapper {
    constructor(dataProvider) {
        this.storedData;
        this.provider = dataProvider;

        this.updateData = () => {
            this.provider.getData()
                .then(data => {
                    this.storedData = data;
                }).catch(err => {
                    // TODO handling
                });
        };

        this.updateData();
        setInterval(this.updateData, 5 * 60 * 1000);
    }

    get data() { return this.storedData; }
}

class DarkSkyWeatherProvider {
    constructor(apikey) {
        const helsinki = { lat: 60.192059, lon: 24.945831 };
        this.units = 'si';
        this.url = `https://api.darksky.net/forecast/${apikey}/${helsinki.lat},${helsinki.lon}?units=${this.units}`;
    }

    getData() {
        return new Promise((resolve, reject) => {
            request
                .get(this.url)
                .end((err, res) => {
                    if (err || !res.ok) {
                        reject(err);
                    } else {
                        resolve({
                            latitude: res.body.latitude,
                            longitude: res.body.longitude,
                            time: res.body.currently.time,                            
                            temperature: res.body.currently.temperature,
                            units: this.units
                        });
                    }
                });
        });
    }
}

module.exports = { wrapper: DataWrapper, provider: DarkSkyWeatherProvider };