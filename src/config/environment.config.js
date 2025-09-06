"use strict";
const fs = require("fs");
const url = require("url");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
const envPath = `${process.cwd()}/src/config/environment/.env.${env}`;
dotenv.config({
  path: envPath
});

module.exports = {
  development: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false
  },
  test: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false
  },
  production: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false
  }
};
