# Dummy Sensor Server

Provides random sensor-like data

* server
  * Express REST API & Socket.io server
* sensors
  * BL, starts new background process and keeps track of active sensors
* sensorProcess
  * Background process which updates sensor's data periodically
* sensorModel
  * Model for sensor
* weather
  * Get weather data periodically from Darksky API

### REST API
```
GET /api/sensor
>
["acdc1","abba5","iddqd","idkfa"]

GET /api/sensor/abba5
>
{ 
    'id': 'abba5',
    'data': 24.940641212025657,
    'timestamp': 1466322901825
}

GET /api/weather
>
{ 
    'latitude': 60.192059,
    'longitude': 24.945831,    
    'time': 1479744195,
    'temperature': 7.12,
    'units': 'si'
}
```

### Socket.io

Listen for events
* listen (expected payload: sensorId)
  * replies with sensorId if sensor is found
* stop (expected payload: sensorId)
  * replies with sensorId if sensor is fond

When sensor has updated data emit message with sensor's id 

## Sample client

* Listen selected sensor's data with socket.io
* Buffer data with RxJS and reduce buffer to single item
* Visualize to C3-chart