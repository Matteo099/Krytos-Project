var USE_DB = true;

var mysql = USE_DB ? require("mysql") : null;

var connection = USE_DB ? mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'mazeadventure'
}) : null;

USE_DB ? connection.connect(function(err) {
	if (err) {
	  console.error('error connecting: ' + err.stack);
	  return;
	}
	console.log('connected as id ' + connection.threadId);
}) : null;

//account:  {username:string, password:string}
//progress:  {username:string, items:[{id:string,amount:number}]}

Database = {};

var h = function(){};

Database.isValidPassword = function(data,cb){
    if(!USE_DB)
		return cb({return:true});
		
	connection.query('SELECT nickname FROM utenti WHERE email="'+data.email+'" AND password="'+data.password+'"',function(error, results, fields){
		if (error) throw error;

		if(results.length>0)
			cb({return:true,username:results[0].nickname,email:data.email});
		else
			cb({return:false});
	});
}

Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
		return cb(false);
	
	connection.query('SELECT * FROM utenti WHERE email="'+data.email+'"',function(error, results, fields){
		if (error) throw error;

		if(results.length > 0) cb({res:true, text:"Email già utilizzata"});
		else {
			connection.query('SELECT * FROM utenti WHERE nickname="'+data.username+'"',function(error, results, fields){
				if (error) throw error;
		
				if(results.length > 0)
					cb({res:true, text:"Nickname già utilizzato"});
				else
					cb({res:false, text:"Account creato!"});
			});
		}
	});
}

Database.addUser = function(data,cb){
    if(!USE_DB)
		return cb();

	data.hero = data.hero || "Iniziale";
	var equip_start = [{id:"SpadaIniziale",amount:1}];
	equip_start = JSON.stringify(equip_start);

	connection.query('INSERT INTO utenti (email, password, nickname, hero) VALUES ("'+data.email+'", "'+data.password+'", "'+data.username+'", "'+data.hero+'")',function(error, results, fields){
		if (error) throw error;

		Database.getHero({nome:data.hero, email:false}, function(res){
			connection.query('INSERT INTO progress (email, items, equip, hp, mp, defence, damage, skills, maxSpd, score, atkSpd) VALUES ("'+data.email+'", \''+equip_start+'\', "[]", "'+res.hp+'", "'+res.mp+'", "'+res.defence+'", "'+res.damage+'", "[]", "'+res.maxSpd+'", "0", "'+res.atkSpd+'")',function(error, results, fields){
				if (error) throw error;
	
				cb();
			});
		});
	});
}

/*
Database.getHero = function(credenziali,cb){
    if(!USE_DB)
		return cb({hp:100,mp:100,defence:0,damage:1});

	var qry = '';
	if(credenziali.nome) qry = 'SELECT heroes.* FROM heroes WHERE heroes.nome="'+credenziali.nome+'"';
	else if(credenziali.email) qry ='SELECT heroes.* FROM heroes INNER JOIN utenti ON heroes.nome = utenti.hero  WHERE utenti.email="'+credenziali.email+'"';
		
	connection.query(qry, function(error, results, fields){
		if (error) throw error;

		var hero = results[0];
		Database.getSpritesheets(hero.animation_idle, function(animation_idle){
			hero.animation_idle = animation_idle;
			Database.getSpritesheets(hero.animation_walking, function(animation_walking){
				hero.animation_walking = animation_walking;
				
				//console.log(hero);
				cb(hero);
			});
		});
	});
}

Database.getSpritesheets = function(id,cb){
    if(!USE_DB)
		return cb();
	
	connection.query('SELECT * FROM spritesheets WHERE id = "'+id+'"', function(error, results, fields){
		if (error) throw error;

		var spritesheet = results[0];
		spritesheet.img_right = blobToImage(spritesheet.img_right);
		spritesheet.img_left = blobToImage(spritesheet.img_left); 
		spritesheet.img_up = blobToImage(spritesheet.img_up); 
		spritesheet.img_down = blobToImage(spritesheet.img_down); 

		spritesheet.property = JSON.parse(spritesheet.property);

		cb(spritesheet);
	});
}
*/

/*
Database.getAllOfItem = function(nome,cb){
    if(!USE_DB)
		return cb();
		
	connection.query('SELECT * FROM items WHERE nome="'+nome+'"',function(error, results, fields){
		if (error) throw error;

		let item = results[0];
		connection.query('SELECT * FROM '+item.tipo+' WHERE nome="'+nome+'"',function(error, results, fields){
			if (error) throw error;

			cb({item:item, item_options:results[0]});
		});
	});
}
*/

/*
Database.getPlayerProgress = function(email,cb){
    if(!USE_DB)
		return cb({items:[]});
		
	connection.query('SELECT * FROM progress WHERE email="'+email+'"',function(error, results, fields){
		if (error) throw error;

		let progress = results[0], inventory = [], equip = [];
		
		progress.items = eval(progress.items);
		progress.equip = eval(progress.equip);
		progress.skills = eval(progress.skills);

		var lenI = progress.items.length, aI = 0;
		var lenE = progress.equip.length, aE = 0;

		progress.items.forEach(element => {
			Database.getAllOfItem(element.id, function(elm){

				elm.item.imgInv = blobToImage(elm.item.imgInv); 

				inventory.push(elm);
				aI++;
				//console.log(a,len);
				if(aI>=lenI){
					if(lenE == 0) continueGetPlayerProgress();
					else continueGetPlayerProgressEquip();
				}
			});
		});

		continueGetPlayerProgressEquip = function(){
			progress.equip.forEach(element => {
				Database.getAllOfItem(element, function(elm){

					elm.item.imgInv = blobToImage(elm.item.imgInv); 

					equip.push(elm);
					aE++;
					console.log(aE,lenE);
					if(aE>=lenE) continueGetPlayerProgress();
				});
			});
		}

		continueGetPlayerProgress = function(){
			Database.getHero({nome:false, email:email}, function(hero){
				if (error) throw error;
	
				Database.getAllOfItem("SpadaIniziale", function(bullet){
					//console.log(inventory);
					progress.inventory = inventory;
					progress.equip = equip;
					cb(progress, hero, bullet);
				});
			})
		}

		if(lenI == 0){
			if(lenE == 0) continueGetPlayerProgress();
			else continueGetPlayerProgressEquip();
		}


		//let res = results[0];
		//cb({items:eval(res.items)});
	});
}
*/

Database.savePlayerProgress = function(data,cb){
    cb = cb || function(){}
    if(!USE_DB)
		return cb();
	
	var inv = [];
	for(var i in data.items)
		inv.push({id:data.items[i].id,amount:data.items[i].amount});
	
	var equip = [];
	equip["arms"] = null;equip["armours"] = null;equip["amulets"] = null;
	for(var i in data.equip)
		equip.push(data.equip[i].id);
		
	inv = JSON.stringify(inv);
	equip = JSON.stringify(equip);
	connection.query('UPDATE progress SET items = \''+inv+'\', equip = \''+equip+'\' WHERE email="'+data.email+'"',function(error, results, fields){
		if(error) throw error;
		cb();
	});
}

/*

Database.getMap = function(name,cb){
    if(!USE_DB)
		return cb({nome:"foresta",img:null});
	
	let qry = 'SELECT * FROM maps';
	if(name!='') qry = 'SELECT * FROM maps WHERE nome="'+name+'"';

	connection.query(qry, function(error, results, fields){
		if (error) throw error;

		results[0].img = blobToImage(results[0].img);
		cb(results[0]);
	});
}

Database.getEnemyFromMap = function(nome,cb){
    if(!USE_DB)
		return cb({nome:"bat",img:null});

	connection.query('SELECT enemys.*,eam.quantita FROM enemys INNER JOIN enemys_appertain_maps AS eam ON eam.nome_enemy = enemys.nome WHERE eam.nome_map="'+nome+'"', function(error, results, fields){
		if (error) throw error;

		var enemys = results;
		var len = enemys.length, a=0;
		//console.log(len, a);

		enemys.forEach(element => {
			element.map = nome;
			Database.getSpritesheets(element.animation_idle, function(animation_idle){
				element.animation_idle = animation_idle;
				Database.getSpritesheets(element.animation_walking, function(animation_walking){
					element.animation_walking = animation_walking;
					
					a++;

					if(a>=len){
						//console.log(enemys);
						cb(enemys);
					}
				});
			});
		});
	});
	
}

*/

Database.getImage = function(nome, cb){
	cb = cb || function(){}
	if(!USE_DB) 
		return cb();

		connection.query('SELECT img FROM images WHERE nome="'+nome+'"', function(error, results, fields){
			if (error) throw error;

			//console.log(results[0])
			cb(blobToImage(results[0]).img); 
		});
}