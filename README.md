## kasirAja API
contoh rest api POS ( point of sales ) built with hapi.js

### frontend
`NextJS (Web App)`: [Coming Soon](#)

`React Native (Mobile App): ` [Coming Soon](#)

### table structure
!(table structure)[https://github.com/ajikamaludin/hapi-kasiraja-api/raw/dev/documents/tables.png]
### feature
- PostgreSQL database
- bisa lebih dari 1 toko `multi store`
- pengelolaan produk, stok dan unit
- pembelian
- penjualan
- diskon penjualan

### documention API
`Postman (import file)` : [Link](#)

### start 
- install

        `npm install`

- config .env file for database

        `cp .env.example .env`

- migrate database

        `npm run migrate up`

- run the app

        `npm run start`

- test

        `curl -i -H 'Accept: application/json' http://localhost:5000/`

response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    {
	    "status": Ok!
    }