'use strict';

const pg = require('pg');

if (!process.env.DATABASE_URL) {
    throw 'Missing DATABASE_URL';
}

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', error => { throw error; });

module.exports = client;