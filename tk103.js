const net = require('net');
const PORT = 6969;
const devices = [];

function synccmds(socket, synccmd1, synccmd2) {
    socket.write(synccmd1);
    console.log('send > ' + synccmd1);
    setTimeout(function () {
        socket.write(synccmd2);
        console.log('send > ' + synccmd2);
    }, 1000);
}

net.createServer(function (socket) {

    console.log('device connected > ' + socket.remoteAddress + ":" + socket.remotePort);

    socket.on('data', function (data) {

        let dataString = data.toString();

        if (dataString.indexOf('imei:') > 0) // ##,imei:863070013269021,A;
        {
            let id = dataString.split(',')[1].substring("imei:".Length).trim();
            socket.name = socket.remoteAddress + ':' + socket.remotePort + ':' + id;
            console.log('found device > ' + socket.name);
            devices.push(socket);
        }

        if (dataString.indexOf('##') === 0) {
            let synccmd1 = 'LOAD';
            let synccmd2 = dataString.replace('##', '**').replace('A', 'B');
            synccmds(socket, synccmd1, synccmd2);
        }

        if (dataString.length === 16) {
            let synccmd1 = 'ON';
            let synccmd2 = '**,imei:' + dataString.replace(';', '') + ',B';
            synccmds(socket, synccmd1, synccmd2);
        }

        // insert data to db
        console.log(dataString);
    });

    socket.on('end', function () {
        devices.splice(devices.indexOf(socket), 1);
        console.log('device disconnected > ' + socket.name);
    });

}).listen(PORT);

console.log('listening on port > ' + PORT);