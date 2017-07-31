//httpを読み込む
var http = require('http');
//フレームワークexpressを読み込む
var express = require('express');
//通信のやり取りを行うsocket.ioの読み込み
var socketIO = require('socket.io');
//portの設定 3000かherokuで準備されているprocess.env.PORTを使用
var port = process.env.PORT || 3000;
//サーバを起動
var app = express.createServer();

//アクセスした時に表示する内容を設定
app.get('/', function (req, res) {
     //index.htmlファイルを読み込む
     res.sendfile(__dirname + '/index.html');
 //    res.send('Hello, World');
});

//ルートディレクトリの設定
app.configure(function () {
    app.use(express.static(__dirname));
});

//ポート番号の付与
app.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socketIO.listen(app);

//設定
io.configure(function () {
   //HerokuではWebSocketがまだサポートされていない？ので、以下の設定が必要
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);

    // socket.ioのログ出力を抑制する
    io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
        console.log('接続：'+ socket.id);
        socket.on('sendData', function(message){
            console.log('データの受信');
            console.log(message);
             // 全ユーザーにメッセージを送る
            io.sockets.emit('returnData', message);
        });

         socket.on("disconnect", function () {
             //切断した人のsocket.idを表示する
             console.log('切断：' + socket.id);
             // 全ユーザーにメッセージを送る
             io.sockets.emit("message", {"value":"user disconnected"});
         });


}); 
