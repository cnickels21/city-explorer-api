'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const app = express();
app.use(cors());

app.get('/location', (request, response) => {
    try {
        superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODEAPI_KEY}`) 
        .then((geoData) => {
            const location = new Location(request.query.data, geoData.body); response.send(location);
        });
    } catch(error) {
        response.status(500).send("Sorry! Something went wrong.")
    }
});