'use strict';

import * as request from 'superagent';

class DataWrapper {
    storedData: any;
    
    constructor(dataProvider : DataProvider) {
        const provider = dataProvider;
        const updateData = () => {
            provider.getData()
                .then(data => {
                    this.storedData = data;
                }).catch(err => {
                    // TODO handling
                });
        };

        updateData();
        setInterval(updateData, 5 * 60);
    }

    get data() : any { return this.storedData; }
}

interface DataProvider {
    getData: () => Promise<any>;
}

class DarkSkyWeatherProvider {
    readonly url: string;
    readonly units: string;

    constructor(apikey : string) {
        const helsinki = { lat: 60.192059, lon: 24.945831 };
        this.units = 'si';
        this.url = `https://api.darksky.net/forecast/${apikey}/${helsinki.lat},${helsinki.lon}?units=${this.units}`;
    }

    getData() : Promise<any> {
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