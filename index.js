
const express = require('express');

require('dotenv').config();

const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.static('public'));

app.use(express.json());

app.use('/api/upload-data', require('./routes/uploadData'));
app.use('/api/finance', require('./routes/reportFinance'));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {

    //SEND TO ALL EXCEPT SENDER
    // socket.broadcast.emit('makeInventory', data);

    socket.on("serverMakeInventory", (data) => {
        socket.broadcast.emit('clientMakeInventory', data);
    });

    socket.on("serverUpdateProductInventory", (data) => {
        socket.broadcast.emit('clientUpdateProductInventory', data);
    });

    socket.on("serverCheckInventory", (data) => {
        socket.broadcast.emit('clientCheckInventory', data);
    });

    socket.on("serverMakeRequisicion", (data) => {
        socket.broadcast.emit('clientMakeRequisicion', data);
    });

    socket.on("serverCompletedProductRequisicion", (data) => {
        socket.broadcast.emit('clientCompletedProductRequisicion', data);
    });

    socket.on("serverEditProductRequisicion", (data) => {
        socket.broadcast.emit('clientEditProductRequisicion', data);
    });

    socket.on("serverCancelProductRequisicion", (data) => {
        socket.broadcast.emit('clientCancelProductRequisicion', data);
    });

    socket.on("serverCheckRequisicion", (data) => {
        socket.broadcast.emit('clientCheckRequisicion', data);
    });

    socket.on("serverCheckProductCedis", (data) => {
        socket.broadcast.emit('clientCheckProductCedis', data);
    });

});


server.listen(process.env.PORT || 5000, () => {
    console.log('APP LISTEN');
});