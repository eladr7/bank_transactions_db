# Summary

This app allows the user to upload a CSV file to be kept in an SQLite DB as a JSON array.

- The DB is kept in a path mentioned by .env::DB_FILE_PATH

## Assumptions:

1. The CSV file must be formatted according to:<br />
   Account Mask,Posted Date,Description,Details,Amount,Balance,Reference Number,currency,type

2. {Account Mask,Posted Date,Description} uniquely identify a transaction
   <br />

## Installation

### `npm i`

## run the app

### `npx tsc && node dist/server.js`

## Examples of usage:

### Upload the file to the DB:

curl -X POST -F "file=@testFile.csv" http://localhost:3000/uploadFile

### Get all transactions:

curl -X GET http://localhost:3000/getTransactions
Or simply from your browser: http://localhost:3000/getTransactions
