'use strict';

const http = require('http');
const express = require('express');
const morgan = require('morgan');
const jsonMiddleware = require('json-middleware');
const socketio = require('socket.io');

const Sensors = require('./sensors');

const app = express();
const port = process.env.PORT || 3000;
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

app.get('/', (req, res) => {
  res.send('Hello from sensors world');
});

app.get('/sensor', (req, res) => {
  res.send(sensors.getSensorsIds());
});

app.get('/sensor/:sensor_id', (req, res) => {
  const data = sensors.getSensorJson(req.params.sensor_id);
  if (data !== null)
    res.send(data);
  else
    res.sendStatus(404);
});

// TODO: Adding needs also a checker which removes inactive sensors
// app.post('/sensor', (req, res) => {
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

  socket.on('listen', function (msg) {
    console.log(`listen event ${msg}`);
    var found = sensors.listenSensor(socket.id, msg);
    if (found)
      socket.emit('listen', msg);
  });

  socket.on('stop', function (msg) {
    var found = sensors.stopListenSensor(socket.id, msg);
    if (found)
      socket.emit('stop', msg);
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port}`);
});

