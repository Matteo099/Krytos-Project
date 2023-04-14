var USE_DB = true;
var mongojs = USE_DB ? require("mongojs") : null;
var db = USE_DB ? mongojs('127.0.0.1:27017/myGame', ['account','progress']) : null;

//account:  {username:string, email:string, password:string}
//progress:  {email:string, items:[{id:string,amount:number}]}

Database = {};
Database.isValidPassword = function(data,cb){
    if(!USE_DB)
        return cb({result:true});
	db.account.findOne({email:data.email, password:data.password},function(err,res){
		if(res)
			cb({result:true, email:res.email, username: res.username});
		else
			cb({result:false});
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
        return cb(false);
	db.account.findOne({username:data.username},function(err,res){
		if(res)
			cb(true, "Username già utilizzato.");
		else{
			db.account.findOne({email:data.email},function(err,res){
				if(res)
					cb(true, "Email già utilizzata.");
				else
					cb(false, "Registrazione avvenuta con successo!");
			});
		}
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
        return cb();

	db.account.insert({username:data.username, email:data.email, password:data.password},function(err){

		let data_hero = {};
		let hero = search_name("Iniziale", heroes);
		let bullet = search_name("Niente", items);

		data_hero.maxSpd = hero.maxSpd;
		data_hero.hp = hero.hp;
		data_hero.hpMax = hero.hp;
		data_hero.mp = hero.mp;
		data_hero.mpMax = hero.mp;
		data_hero.damage = hero.damage;
		data_hero.defence = hero.defence;
		data_hero.score = 0;
		data_hero.atkSpd = hero.atkSpd;
		data_hero.livello = 0;
		data_hero.class = "Iniziale";
		data_hero.esperienza = 0;
		data_hero.gold = 0;
		data_hero.gemme = 0;
		data_hero.regHp = 0.1;
		data_hero.regMp = 0.1;
		data_hero.puntiStat = 0;
		data_hero.map = "Island";
		data_hero.pet = undefined;

		data_hero.bulletSpeed = bullet.bulletSpeed;
		data_hero.bulletTimeToRemove = bullet.bulletTimeToRemove;
		data_hero.imgBullet = bullet.imgBullet;
		data_hero.damageMin = bullet.damageMin;
		data_hero.damageMax = bullet.damageMax;
		data_hero.timeToAttack = bullet.timeToAttack;
		data_hero.timeToSuperAttack = bullet.timeToSuperAttack;
		data_hero.numShotSuperAttack = bullet.numShotSuperAttack;

        Database.savePlayerProgress({email:data.email, items:[], short_inv:[], skill:[], missioni:{missioni:[], missioniCompletate:[], mostri:[]}, equip:{arma:null,elmo:null,armatura:null,collana:null,anello:null}, hero:data_hero},function(){
            cb();
        })
	});
}
Database.getPlayerProgress = function(email,cb){
    if(!USE_DB)
        return cb({items:[]});
	db.progress.findOne({email:email},function(err,res){
		cb({items:res.items, equip:res.equip, hero:res.hero, short_inv:res.short_inv, skill:res.skill, missioni:res.missioni});
	});
}
Database.savePlayerProgress = function(data,cb){
    cb = cb || function(){}
    if(!USE_DB)
        return cb();
    db.progress.update({email:data.email},{ $set: data },{upsert:true},cb);
}