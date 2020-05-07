const express = require('express')
const app = express()
const port = 3000
const sqlite3 = require('sqlite3').verbose();
const haversine = require('haversine');

// CREATE TABLE cab_info (
//     id INTEGER PRIMARY KEY,
//        latitude TEXT NOT NULL,
//     longitude TEXT NOT NULL,
//     driver_name TEXT NOT NULL,
//     phone TEXT NOT NULL,
//     is_pink_car BOOLEAN DEFAULT 0,
//     is_available BOOLEAN DEFAULT 1,
//     car_num_plate TEXT NOT NULL
// );

let db = new sqlite3.Database('./db/car.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the car database.');
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/getCab', (req, res) => {
    const passLat = req.query.lat;
    const passLong = req.query.long;
    const pinkCab = req.query.pink;
    
    const start = {
        latitude: 21.179635,
        longitude: 72.834559
    }
    
    
    let db = new sqlite3.Database('./db/car.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the car database.');
    });

    let distanceBtwn = 0;
    let minDist = Infinity;
    let cabInfo = {}

    db.serialize(() => {
        db.each(`SELECT *
        FROM cab_info where is_available = 1`, (err, row) => {
            if (err) {
                console.error(err.message);
            }

            const end = {
                latitude: row.latitude,
                longitude: row.longitude
            }

            distanceBtwn = haversine(start, end, {unit: 'meter'})
            if (distanceBtwn < minDist) {
                minDist = distanceBtwn;
                cabInfo['driver'] = row['driver_name'];
                cabInfo['phone'] = row['phone'];
                cabInfo['num_plate'] = row['car_num_plate'];
            }

            console.log(row.id + "\t" + row.name);
        });
    });
    
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
        if(minDist < 1000){
            minDist = Math.round(minDist.toString()) + " m";
        }
        else{
            minDist = (minDist/1000).toFixed(2).toString() + " km";
        }
    
        console.log(minDist);
        console.log(cabInfo);
    });
    



    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


