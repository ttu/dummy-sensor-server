'use strict';

const http = require('http');
const express = require('express');
var cors = require('cors')
const morgan = require('morgan');
const jsonMiddleware = require('json-middleware');
const socketio = require('socket.io');

const Sensors = require('./sensors');
const WeatherProvider = require('./weather').provider;
const DataWrapper = require('./weather').wrapper;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(jsonMiddleware.middleware());
app.use(express.static('public'));

const server = http.Server(app);
const io = socketio(server);

const sensors = new Sensors((data) => {
  io.emit(data.id, data);
});

// Add default sensors
sensors.addSensor('acdc1');
sensors.addSensor('abba5');
sensors.addSensor('iddqd', { initial: 24, min: 18, max: 28, updateValue: 0.002 });
sensors.addSensor('idkfa', { initial: 22, min: 17, max: 26, updateValue: 0.003 });

app.get('/api/', (req, res) => {
  res.send('Hello from sensors world');
});

app.get('/api/sensor', (req, res) => {
  res.send(sensors.getSensorsIds());
});

app.get('/api/sensor/:sensor_id', (req, res) => {
  const data = sensors.getSensorJson(req.params.sensor_id);
  if (data !== null)
    res.send(data);
  else
    res.sendStatus(404);
});

const darkSkyApiKey = process.env.DARKSKY_API_KEY;

if (darkSkyApiKey) {
  const maxDelay = process.env.WEATHER_DELAY || 4000;
  const weatherProvider = new WeatherProvider(darkSkyApiKey);
  const weather = new DataWrapper(weatherProvider);

  app.get('/api/weather', (req, res) => {
    // Simulate slow response
    const timeOut = Math.random() * maxDelay;
    setTimeout(() => {
      res.send(weather.data);
    }, timeOut);
  });
}

// TODO: Adding needs also a checker which removes inactive sensors
// app.post('/api/sensor', (req, res) => {
//   return sensors.addSensor().then(sensor => {
//     res.status(200).send(sensor);
//   });
// });

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
    sensors.stopListenSensorAll(socket.id);
  });

  socket.on('listen', (msg) => {
    console.log(`listen event ${msg}`);
    var found = sensors.listenSensor(socket.id, msg);
    if (found)
      socket.emit('listen', msg);
  });

  socket.on('stop', (msg) => {
    var found = sensors.stopListenSensor(socket.id, msg);
    if (found)
      socket.emit('stop', msg);
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port}`);
});

