var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var POST = process.env.PORT || 8080;
var userCnt = {
		a : 0,
		b : 0
	}
var json = JSON.parse(fs.readFileSync('./data/ngwords.json', 'utf8'));
var path  = require('path');
var iconv = require('iconv-lite');
var date = require('date-utils');

const dist  = path.join( process.env.PWD || process.cwd() , "data/send.csv")   // 書き出すファイルのパス

//ルートディレクトリにアクセスした時に動く処理
app.get('/', function(req, res) {
	//index.htmlに遷移する
	res.sendFile(__dirname + '/index.html');
});
//nodeからcss呼び出し
app.use('/css', express.static('css'));
//nodeからimg呼び出し
app.use('/images', express.static('images'));
app.use('/js', express.static('js'));
app.use('/php', express.static('php'));


//socket.ioに接続された時に動く処理
io.on('connection', function(socket) {

	socket.on('message', function(msj) {

		var isngwords = false;

		for (let i = 0; i < json.data.length; i++) {
			if (msj.match(json.data[i])){
				isngwords = true;
			}
		}

		var dt = new Date();
		var formatted = dt.toFormat("MM/DD HH24:MI:SS");

		const text   = msj+":"+isngwords+":"+formatted+"\n";

		let buf   = iconv.encode( text , "utf-8" );

		fs.appendFile("data/out.txt", buf, function (err) {
			if(err){
				console.log("エラーです");
				throw err;
			}
		});

		fs.readFile("data/out.txt", 'utf-8', function (err, text) {
		    console.log('text file!');
		    console.log(text);
		    console.log('error!?');
		    console.log(err);
		});

		console.log(text);//TODO:ログ出力

		if(isngwords){
			io.emit('ngwords',msj);
		}else{
			io.sockets.emit("S_to_C_message", {
				value:msj
			});
		}
	});
	socket.on('btn', function(num) {
		//io.sockets.in(channel).emit('message', msj, socket.id);
		console.log("img_"+num);
		io.sockets.emit("S_to_C_img", {
			value:num
		});

	});

});

//接続待ち状態になる
http.listen(POST, function() {
	console.log('接続開始：', POST);
});
