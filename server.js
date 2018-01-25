var express=require('express'),
		app=express(),
		server=require('http').createServer(app),
		io=require('socket.io').listen(server);
		usernames=[];

var mysql      = require('mysql');
var connection = mysql.createConnection({
  		host     : 'localhost',
  		user     : 'root',
  		password : '',
  		database : 'node_db'
});

connection.connect((err)=>{

	if(err){
		throw err;
	}
	console.log('Mysql Connected....');
});
//=======create database==========================
app.get('/createdb',(req,res)=>{
	let sql='CREATE DATABASE node_db';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('Database Created.....');
	});
});

//=======create row==========================
app.get('/createusertable',(req,res)=>{
	let sql='CREATE TABLE users(id int AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id), UNIQUE KEY(username))';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('.......User Table Created.....');
	});
});
//==================adding new user===================================
app.get('/addingnewuser',(req,res)=>{
	let newuser={username:'gilbert', password:'niyongere'};
	let sql='INSERT INTO users SET ?';
	connection.query(sql,newuser,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('New User added.....');
	});
});


//=====================get users===========================================
app.get('/getusers',(req,res)=>{
	
	let sql='SELECT * FROM users';
	connection.query(sql, (err, results) =>{
		if(err)throw err;
		console.log(results);
		res.send('Users Selected....');
	});
});

//===================================select single user=================================================
app.get('/getuser/:id',(req,res)=>{
	
	let sql =`SELECT * FROM users WHERE id = ${req.params.id}`;
	connection.query(sql, (err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('User Selected....');
	});
});

//==========================================================================
server.listen(process.env.PORT || 3000);
console.log('Server Running..');
app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
  console.log('Socket Connected..');

  socket.on('nuser', function(data1, data2, callback){
  		if(usernames.indexOf(data1)!=-1){

  			callback(false);

  		}else{
  			callback(true);
  			socket.username = data1;
  			socket.password = data2;
  			console.log(socket.password);
  			console.log(socket.username);

            let newuser={username:socket.username, password:socket.password};
			let sql='INSERT INTO users SET ?';
			connection.query(sql,newuser,(err, result) =>{
					if(err)throw err;
					console.log(result);
				//res.send('New User added.....');
			});

            //=====================================================
             let signedUser = socket.username;
             let sql1 = `SELECT * FROM users WHERE username = '${signedUser}'`;
			 connection.query(sql1, (err, result) =>{
			 	
				if(err)throw err;
					console.log('---------Checking signed user----------');
					console.log(result);
					console.log(result["username"]);

		     	    //res.send('Username updated successfully.....');
	});


            //========================================================
  			usernames.push(socket.username);
  			updateUsernames();
  		}

  });



  //update username
  function updateUsernames(){
  	io.sockets.emit('usernames',usernames);
  }
	//send message...
  socket.on('smessage', function(data1){
  		io.sockets.emit('nmessage', {msg: data1, user: socket.username});
  });

//===========disconnect =======
  socket.on('disconnect', function(data1){
  	if(!socket.username){
  		return;
  	}
  	usernames.splice(usernames.indexOf(socket.username,1));
  	updateUsernames();

  });

});
