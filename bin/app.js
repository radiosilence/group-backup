#!/usr/bin/env node
const config = require('config')
const app = require('../dist/app').app

app.listen(config.get('app').port, () => {
  console.log(`listening on ${config.get('app').port}`)
})
