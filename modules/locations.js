'use strict';

const superagent = require('superagent');
const client = require('../util/db');

function setLocationInCache(location) {
    const { search_query, formatted_query, latitude, longitude } = location;
    const SQL = `
      INSERT INTO locations (search_query, formatted_query, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `;
    const parameters = [search_query, formatted_query, latitude, longitude];

    return client.query(SQL, parameters)
        .then(results => {
            console.log('Cache location', results);
        })
        .catch(error => console.error(error));
}

function getLocationFromCache(city) {
    const SQL = `
    SELECT *
    FROM Locations
    WHERE search_query = $1
    LIMIT 1
    `;
    const parameters = [city];

    return client.query(SQL, parameters);
}

function getLocationFromAPI(city, response) {
    const url = 'https://us1.locationiq.com/v1/search.php';
    superagent.get(url)
        .query({
            key: process.env.GEO_KEY,
            q: city,
            format: 'json'
        })
        .then(locationResponse => {
            let geoData = locationResponse.body;
            const location = new Location(city, geoData);
            setLocationInCache(location, response)
                .then(() => {
                    response.send(location);
                })
        })
        .catch(error => {
            console.log(error);
            errorHandler(error, request, response);
        })
}

function locationHandler(request, response) {

    const city = request.query.city;

    getLocationFromCache(city)
        .then(result => {
            let { rowCount, rows } = result;
            if (rowCount > 0) {
                response.send(rows[0]);
            } else {
                return getLocationFromAPI(city, response);
            }
        })
}

function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = parseFloat(geoData[0].lat);
    this.longitude = parseFloat(geoData[0].lon);
}

module.exports = locationHandler;