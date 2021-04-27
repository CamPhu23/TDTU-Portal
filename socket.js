let io;
const socketio = require('socket.io')

module.exports = {
  init: (server) => {
    io = socketio(server); 

    return io;
  },
  get: () => {
    if (!io) {throw new Error("socket is not initialized");}

    return io;
  }
};