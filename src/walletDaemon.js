const protoLoader = require('@grpc/proto-loader')
const gRPC = require('@grpc/grpc-js')

const { EventEmitter } = require('events')

module.exports = class walletNode extends EventEmitter {
  constructor (nodeAddress, readyCallback) {
    super()

    const packageDefinition = protoLoader.loadSync(__dirname + '/../protos/cryptixwalletd.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })

		const { cryptixwalletd } = gRPC.loadPackageDefinition(packageDefinition).cryptixwalletd

    this._client = new cryptixwalletd(nodeAddress, gRPC.credentials.createInsecure(), {  
      "grpc.max_receive_message_length": -1
    })

    process.nextTick(() => readyCallback())
  }

  getAddresses () {
    return new Promise((resolve, reject) => {
      this._client.ShowAddresses({}, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.address)
      })
    })
  }

  checkAddress (address) {
    return new Promise((resolve, reject) => {
      this._client.CheckIfAddressIsValid({ address }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.isValid)
      })
    })
  }

  createAddress () {
    return new Promise((resolve, reject) => {
      this._client.NewAddress({}, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.address)
      })
    })
  }

  send (recipient, amount, password) {
    return new Promise((resolve, reject) => {
      this._client.Send({ toAddress: recipient, amount, password, from: [] }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.txIDs)
      })
    })
  }

  sendFrom (sender, recipient, amount, password) {
    return new Promise((resolve, reject) => {
      this._client.Send({ toAddress: recipient, amount, password, from: [ sender ] }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.txIDs)
      })
    })
  }
}