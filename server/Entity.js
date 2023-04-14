var initPack = {player:[], bullet:[], enemy:[], pet:[], minion:[], drop:[], abilita:[], canvasText:[], npc:[], dungeon:[]};
var removePack = {player:[], bullet:[], enemy:[], pet:[], minion:[], drop:[], abilita:[], canvasText:[], npc:[], dungeon:[]};
var PVP = false;
SOCKET_LIST = {};

testCollisionRectRect = function(rect1,rect2){
	return rect1.x <= rect2.x+rect2.width 
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}
randomNumber = function(min, max) {
    return Math.floor(min + Math.random()*(max+1 - min))
}
isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

Entity = function(param){
    var self = {
        x:500,
        y:500,
        spdX:0,
        spdY:0,
        id:"",
        map:'Forest'
    };

    if(param){
        if(param.x) self.x = param.x;
        if(param.y) self.y = param.y;
        if(param.map) self.map = param.map;
        if(param.id) self.id = param.id;
        if(param.socket) self.socket = param.socket;
    }
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
    self.testCollision = function(entity2){	//return if colliding (true/false)
		var rect1 = {
			x:self.x-self.width/2,
			y:self.y-self.height/2,
			width:self.width,
			height:self.height,
		}
		var rect2 = {
			x:entity2.x-entity2.width/2,
			y:entity2.y-entity2.height/2,
			width:entity2.width,
			height:entity2.height,
		}
		return testCollisionRectRect(rect1,rect2);
    }
    
    return self;
}
Entity.getFrameUpdateData = function(){
    var pack = {
        initPack:{
            player: initPack.player,
            bullet: initPack.bullet,
            enemy: initPack.enemy,
            pet: initPack.pet,
            minion: initPack.minion,
            drop: initPack.drop,
            abilita: initPack.abilita,
            dungeon: initPack.dungeon,
            canvasText: initPack.canvasText,
            npc: initPack.npc
        },
        removePack:{
            player: removePack.player,
            bullet: removePack.bullet,
            enemy: removePack.enemy,
            pet: removePack.pet,
            minion: removePack.minion,
            drop: removePack.drop,
            abilita: removePack.abilita,
            dungeon: removePack.dungeon,
            canvasText: removePack.canvasText,
            npc: removePack.npc
        },
        updatePack:{
            player: Player.update(),
            bullet: Bullet.update(),
            enemy: Enemy.update(),
            pet: Pet.update(),
            minion: Minion.update(),
            drop: Drop.update(),
            abilita: Abilita.update(),
            dungeon: Dungeon.update(),
            canvasText: CanvasText.update(),
            npc: NPC.update()
        }
    }

    //svuota initPack
    for(var i in initPack) initPack[i] = [];
    for(var i in removePack) removePack[i] = [];

    //console.log(pack.updatePack);

    return pack;
}


NPC = function(param){
    var self = Entity(param);

    self.id = Math.random();
    self.param = param;

    self.nome = param.nome;
    self.map = param.map;
    self.img = param.img;
    self.x = param.x;
    self.y = param.y;
    self.vendeOggetti = param.vendeOggetti;
    
    if(self.vendeOggetti){
        self.negozio = param.negozio;
        
        for(var i in self.negozio){
            let itm = search_name(self.negozio[i].nome, items);
            self.negozio[i].item = itm;
        }
    }else self.negozio = null;

    var super_update = self.update;

    self.update = function(){
        super_update();
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            nome:self.nome,
            img:self.img,
            map:self.map,
            negozio:self.negozio
        };
    }
    self.getUpdatePack = function(){
        return {};
    }
    
    NPC.list[self.id] = self;
    initPack.npc.push(self.getInitPack());
    return self;
}
NPC.list = {};
NPC.update = function(){

    var pack = [];
    for(var i in NPC.list){
        var npc = NPC.list[i];
        npc.update();
        if(npc.toRemove){
            delete NPC.list[i];
            removePack.npc.push(npc.id);
        }else{
            pack.push(npc.getUpdatePack());
        }
    }
    return pack;
}
NPC.getAllInitPack = function(){
    var npcs_ = [];
    for(var i in NPC.list){
        npcs_.push(NPC.list[i].getInitPack());
    }
    return npcs_;
}



Pet = function(param){
    var self = Entity(param);
    self.id = Math.random();

    self.parent = param.parent;
    self.nome = param.nome;
    self.map = param.map;

    self.regHp = param.regHp;
    self.regMp = param.regMp;
    self.damage = param.damage;
    self.atkSpd = param.atkSpd;
    self.speed = param.speed;
    self.livello = param.livello;

    self.abilita = param.abilita;
    self.magia = param.magia;
    self.fai_magia = param.fai_magia;

    self.timeToAttack = param.timeToAttack;
    self.timeToSuperAttack = param.timeToSuperAttack;
    self.numShotSuperAttack = param.numShotSuperAttack; //DEVE sempre dispari!!!

    self.animation = param.animation;

    self.bulletSpeed = param.bulletSpeed;
    self.bulletTimeToRemove = param.bulletTimeToRemove;
    self.bulletImgSrc = param.bulletImgSrc;
    self.bulletFrWidth = param.bulletFrWidth || 1;
    self.bulletFrHeight = param.bulletFrHeight || 1;
    self.bulletRatio = param.bulletRatio || 1.5;
    self.bulletAnimationSpeed = param.bulletAnimationSpeed || 0;

    self.range = param.range;
    
    self.angle = 0;
    self.attackCounter = 0;
    self.superAttackCounter = 0;

    self.target = false;
    self.magia_carica = false;

    self.toRemove = false;
    self.timer = 0;
    var super_update = self.update;

    self.update = function(){


        /// DA MODIFICARE UNA VOLTA PRESO UN DROP NON SI MUOVE

        self.existParent();
        if(!self.raccogliendo) self.move();

        if(self.abilita.indexOf("attacca") != -1) self.attack();
        if(self.target) self.shotBullet();

        if(self.abilita.indexOf("raccogli") != -1) self.raccogli();
        
        if(self.abilita.indexOf("magia") != -1 && self.magia != null) if(self.timer++>self.fai_magia) self.magia_carica = true;      


        for(var i in Player.list){
            let p = Player.list[i];
            if(p.id == self.parent){
                if(self.raccogliendo) p.collectItem = true;
                else if(!self.raccogliendo && p.collectItemPet) p.collectItem = true;
                else if(!self.raccogliendo && !p.collectItemPet) p.collectItem = false;
            }
        }

        super_update();

        self.attackCounter += self.atkSpd;
        self.superAttackCounter++;
        
    }
    self.existParent = function(){
        let exist = false;
        for(var i in Player.list){
            let p = Player.list[i];
            if(p.id == self.parent) exist = true;
        }

        if(!exist) self.toRemove = true;
    }

    self.faiMagia = function(){
        self.timer = 0;
        self.magia_carica = false;

        let a = search_name(self.magia.nome, pet_skills);

        for(var i in a.miglioramenti){
            let m = a.miglioramenti[i];
            if(i == self.magia.livello){
                a.timeToReuse = m.timeToReuse;
                a.timeEffect = m.timeEffect;
                a.numeroColpi = m.numeroColpi;
                a.range = m.range;
                a.ratio = m.ratio;
                a.bonus = m.bonus;
            }
        }

        let faiSkill = true;

        for(var i in Abilita.used){
            let au = Abilita.used[i];
            if(au.nome == self.nome && au.parent.id == self.parent){
                faiSkill = false;
                break;
            }
        } 


        if(faiSkill){
            a.x = self.x;
            a.y = self.y;
            a.map = self.map;
            a.target = self;
            a.parent = self;
            for(var i in Player.list){
                let p = Player.list[i];
                if(p.id == self.parent) a.petParent = p;
            }

            if(a.option.type == "self") Abilita(a);
            if(a.option.type == "enemy"){

                var nC = a.numeroColpi;
                for(var i in Enemy.list){
                    var e = Enemy.list[i];
                    if(self.map === e.map && self.getDistance(e) < a.range){
                        a.target = e;
                        Abilita(a);
                        nC--;
                    }
                    if(nC<=0) break;
                }

                for(var i=0;i<nC;i++){
                    var pos = { 
                        x:randomNumber(self.x-(a.range*a.ratio)/2, self.x+(a.range*a.ratio)/2),
                        y:randomNumber(self.y-(a.range*a.ratio)/2, self.y+(a.range*a.ratio)/2)
                    }

                    a.x = pos.x;
                    a.y = pos.y;
                    a.target = null;
                    Abilita(a);
                }

            }
            if(a.option.type == "player"){
                let nC = a.numeroColpi;
                for(var i in Player.list){
                    var p = Player.list[i];
                    if(self.map === p.map && self.getDistance(p) < a.range){
                        a.target = p;
                        Abilita(a);
                        nC--;
                    }
                    if(nC<=0) break;
                }
            }
            if(a.option.type == "player_collision"){
                for(var i in Player.list){
                    var p = Player.list[i];
                    if(self.map === p.map && self.getDistance(p) < a.range*a.ratio){
                        a.target = p;
                        Abilita(a);
                    }
                }
            }
            if(a.option.type == "enemy_collision"){

                for(var i=0;i<a.numeroColpi;i++){

                    var pos = { 
                        x:randomNumber(self.x-(a.range)/2, self.x+(a.range)/2),
                        y:randomNumber(self.y-(a.range)/2, self.y+(a.range)/2)
                    }

                    for(var i in Enemy.list){
                        var e = Enemy.list[i];
                        if(self.map === e.map && self.getDistance(e) < a.range){
                            pos.x = e.x;
                            pos.y = e.y;
                            break;
                        }
                    }


                    a.x = pos.x;
                    a.y = pos.y;

                    a.targets = [];

                    for(var i in Enemy.list){
                        var e = Enemy.list[i];
                        if(self.map === e.map && e.getDistance(pos) < a.range){
                            //a.target = p;
                            a.targets.push(e);
                        }
                    }

                    Abilita(a);
                }
            }
        }


    }

    self.raccogli = function(){
        var min = null;
        for(var i in Drop.list){
            let e = Drop.list[i];
            
            if(min != null && self.map === e.map && self.getDistance(min) > self.getDistance(e)) min = e;
            else if(min === null) min = e;
        }

        var p = min;
        if(p !== null){
            if(self.map === p.map && self.getDistance(p) < self.range){
                if(self.getDistance(p) < 5){self.spdX = 0;self.spdY = 0;return;}
                
                self.raccogliendo = true;
                var dx = p.x - self.x;
                var dy = p.y - self.y;
                self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                var distance = Math.sqrt((dx*dx) + (dy*dy));
                self.spdX = self.speed * (dx/distance);
                self.spdY = self.speed * (dy/distance);
            }else self.raccogliendo = false;
        }else self.raccogliendo = false;

        
    }

    self.attack = function(){
        //vedi il personaggio più vecino al mostro
        var min = null;
        for(var i in Enemy.list){
            let e = Enemy.list[i];
            
            if(min != null && self.map === e.map && self.getDistance(min) > self.getDistance(e)) min = e;
            else if(min === null) min = e;
        }

        //muovi il mostro verso il persognaggio più vicino
        var p = min;
        if(p !== null){
            if(self.map === p.map && self.getDistance(p) < self.range){
                if(self.getDistance(p) < 5){self.spdX = 0;self.spdY = 0;return;}
                
                self.target = true;
                var dx = p.x - self.x;
                var dy = p.y - self.y;
                self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                //var distance = Math.sqrt((dx*dx) + (dy*dy));
                //self.spdX = self.speed * (dx/distance);
                //self.spdY = self.speed * (dy/distance);
            }else{
                self.target = false;
                //self.spdX = 0;
                //self.spdY = 0;
            } 
        }   
    }

    self.move = function(){

        for(var i in Player.list){
            let p = Player.list[i];
            if(p.id == self.parent){
                //pet di p
                if(!self.target){
                    var dx = p.x - self.x;
                    var dy = p.y - self.y;
                    self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                }

                if(self.getDistance(p) > 500){
                    self.x = p.x;
                    self.y = p.y;
                    self.spdX = 0;
                    self.spdY = 0;
                }else if(self.getDistance(p) > 50){
                    var dx = p.x - self.x;
                    var dy = p.y - self.y;
                    var distance = Math.sqrt((dx*dx) + (dy*dy));
                    self.spdX = self.speed * (dx/distance);
                    self.spdY = self.speed * (dy/distance);
                }else{
                    self.spdX = 0;
                    self.spdY = 0;
                }
            }
        }
    }
    self.shotBullet = function(){

        if(self.magia_carica) self.faiMagia();

        if(self.attackCounter > self.timeToAttack && self.superAttackCounter < self.timeToSuperAttack){
            self.attackCounter = 0;
            Bullet({
                parent:self.id,
                angle:self.angle,
                x:self.x,
                y:self.y,
                map:self.map,
                type:"pet",
                speed:self.bulletSpeed,
                timeToRemove:self.bulletTimeToRemove,
                imgSrc:self.bulletImgSrc,
                frWidth:self.bulletFrWidth,
                frHeight:self.bulletFrHeight,
                ratio:self.bulletRatio,
                animationSpeed:self.bulletAnimationSpeed
            });
        }

        if(self.superAttackCounter > self.timeToSuperAttack){
            self.superAttackCounter = 0;
            let amplifier = Math.floor(self.numShotSuperAttack-1/2);
            for(var i=0;i<self.numShotSuperAttack;i++)
                Bullet({
                    parent:self.id,
                    angle:self.angle-7*amplifier+i*7,
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    type:"pet",
                    speed:self.bulletSpeed,
                    timeToRemove:self.bulletTimeToRemove,
                    imgSrc:self.bulletImgSrc,
                    frWidth:self.bulletFrWidth,
                    frHeight:self.bulletFrHeight,
                    ratio:self.bulletRatio,
                    animationSpeed:self.bulletAnimationSpeed
     
                });
        }
    }


    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            regHp:self.regHp,
            regMp:self.regMp,
            damage:self.damage,
            atkSpd:self.atkSpd,
            angle:self.angle,
            spdX:self.spdX,
            spdY:self.spdY,

            animation:self.animation,
        };
    }
    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}
        if(self.map !=  self.LASTMAP){obj.map = self.map;self.LASTMAP = self.map;}
        if(self.regHp !=  self.LASTREGHP){obj.regHp = self.regHp;self.LASTREGHP = self.regHp;}
        if(self.regMp !=  self.LASTREGMP){obj.regMp = self.regMp;self.LASTREGMP = self.regMp;}
        if(self.damage !=  self.LASTDAMAGE){obj.damage = self.damage;self.LASTDAMAGE = self.damage;}
        if(self.atkSpd !=  self.LASTATKSPD){obj.atkSpd = self.atkSpd;self.LASTATKSPD = self.atkSpd;}
        if(self.angle !=  self.LASTANGLE){obj.angle = self.angle;self.LASTANGLE = self.angle;}
        if(self.spdX !=  self.LASTSPDX){obj.spdX = self.spdX;self.LASTSPDX = self.spdX;}
        if(self.spdY !=  self.LASTSPDY){obj.spdY = self.spdY;self.LASTSPDY = self.spdY;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return;

        return obj;
        /*
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            regHp:self.regHp,
            regMp:self.regMp,
            damage:self.damage,
            atkSpd:self.atkSpd,
            angle:self.angle,
            spdX:self.spdX,
            spdY:self.spdY,
        }*/
    }
    
    Pet.list[self.id] = self;
    initPack.pet.push(self.getInitPack());
    return self;
}
Pet.list = {};

Pet.update = function(){

    var pack = [];
    for(var i in Pet.list){
        var pet = Pet.list[i];
        pet.update();
        if(pet.toRemove){
            delete Pet.list[i];
            removePack.pet.push(pet.id);
        }else{
            pack.push(pet.getUpdatePack());
        }
    }
    return pack;
}
Pet.getAllInitPack = function(){
    var pets_ = [];
    for(var i in Pet.list){
        pets_.push(Pet.list[i].getInitPack());
    }
    return pets_;
}

















Minion = function(param){
    var self = Entity(param);
    self.id = Math.random();

    self.parent = param.parent;
    self.nome = param.nome;
    self.map = param.map;

    self.hp = param.hp;
    self.hpMax = param.hp;
    self.regHp = param.regHp;
    self.damage = param.damage;
    self.defence = param.defence;
    self.atkSpd = param.atkSpd;
    self.speed = param.speed;

    self.timeToAttack = param.timeToAttack;
    self.timeToSuperAttack = param.timeToSuperAttack;
    self.numShotSuperAttack = param.numShotSuperAttack; //DEVE sempre dispari!!!

    self.animation = param.animation;

    self.bulletSpeed = param.bulletSpeed;
    self.bulletTimeToRemove = param.bulletTimeToRemove;
    self.bulletImgSrc = param.bulletImgSrc;
    self.bulletFrWidth = param.bulletFrWidth || 1;
    self.bulletFrHeight = param.bulletFrHeight || 1;
    self.bulletRatio = param.bulletRatio || 1.5;
    self.bulletAnimationSpeed = param.bulletAnimationSpeed || 0;

    self.range = param.range;
    
    self.angle = 0;
    self.attackCounter = 0;
    self.superAttackCounter = 0;

    self.target = false;

    self.toRemove = false;
    self.timer = 0;
    self.timeLife = param.timeLife || 200;
    var super_update = self.update;

    self.update = function(){

        self.existParent();
        self.move();
    
        self.attack();
        if(self.target) self.shotBullet();   

        super_update();

        self.attackCounter += self.atkSpd;
        self.superAttackCounter++;

        if(self.timer++>self.timeLife) self.toRemove = true;
        
    }
    self.existParent = function(){
        let exist = false;
        for(var i in Player.list){
            let p = Player.list[i];
            if(p.id == self.parent) exist = true;
        }

        if(!exist) self.toRemove = true;
    }

    self.attack = function(){
        //vedi il personaggio più vecino al mostro
        var min = null;
        for(var i in Enemy.list){
            let e = Enemy.list[i];
            
            if(min != null && self.map === e.map && self.getDistance(min) > self.getDistance(e)) min = e;
            else if(min === null) min = e;
        }

        //muovi il mostro verso il persognaggio più vicino
        var p = min;
        if(p !== null){
            if(self.map === p.map && self.getDistance(p) < self.range){
                if(self.getDistance(p) < 5){self.spdX = 0;self.spdY = 0;return;}
                
                self.target = true;
                var dx = p.x - self.x;
                var dy = p.y - self.y;
                self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                //var distance = Math.sqrt((dx*dx) + (dy*dy));
                //self.spdX = self.speed * (dx/distance);
                //self.spdY = self.speed * (dy/distance);
            }else{
                self.target = false;
                //self.spdX = 0;
                //self.spdY = 0;
            } 
        }   
    }

    self.move = function(){

        for(var i in Player.list){
            let p = Player.list[i];
            if(p.id == self.parent){
                //mionin di p
                if(!self.target){
                    var dx = p.x - self.x;
                    var dy = p.y - self.y;
                    self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                }

                if(self.getDistance(p) > 500){
                    self.x = p.x;
                    self.y = p.y;
                    self.spdX = 0;
                    self.spdY = 0;
                }else if(self.getDistance(p) > 50){
                    var dx = p.x - self.x;
                    var dy = p.y - self.y;
                    var distance = Math.sqrt((dx*dx) + (dy*dy));
                    self.spdX = self.speed * (dx/distance);
                    self.spdY = self.speed * (dy/distance);
                }else{
                    self.spdX = 0;
                    self.spdY = 0;
                }
            }
        }
    }
    self.shotBullet = function(){

        if(self.attackCounter > self.timeToAttack && self.superAttackCounter < self.timeToSuperAttack){
            self.attackCounter = 0;
            Bullet({
                parent:self.id,
                angle:self.angle,
                x:self.x,
                y:self.y,
                map:self.map,
                type:"minion",
                speed:self.bulletSpeed,
                timeToRemove:self.bulletTimeToRemove,
                imgSrc:self.bulletImgSrc,
                frWidth:self.bulletFrWidth,
                frHeight:self.bulletFrHeight,
                ratio:self.bulletRatio,
                animationSpeed:self.bulletAnimationSpeed
            });
        }

        if(self.superAttackCounter > self.timeToSuperAttack){
            self.superAttackCounter = 0;
            let amplifier = Math.floor(self.numShotSuperAttack-1/2);
            for(var i=0;i<self.numShotSuperAttack;i++)
                Bullet({
                    parent:self.id,
                    angle:self.angle-7*amplifier+i*7,
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    type:"minion",
                    speed:self.bulletSpeed,
                    timeToRemove:self.bulletTimeToRemove,
                    imgSrc:self.bulletImgSrc,
                    frWidth:self.bulletFrWidth,
                    frHeight:self.bulletFrHeight,
                    ratio:self.bulletRatio,
                    animationSpeed:self.bulletAnimationSpeed
     
                });
        }
    }


    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            hp:self.hp,
            hpMax:self.hpMax,
            angle:self.angle,
            spdX:self.spdX,
            spdY:self.spdY,

            timeLife:self.timeLife,

            animation:self.animation,
        };
    }
    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}
        if(self.map !=  self.LASTMAP){obj.map = self.map;self.LASTMAP = self.map;}
        if(self.hp !=  self.LASTHP){obj.hp = self.hp;self.LASTHP = self.hp;}
        if(self.angle !=  self.LASTANGLE){obj.angle = self.angle;self.LASTANGLE = self.angle;}
        if(self.spdX !=  self.LASTSPDX){obj.spdX = self.spdX;self.LASTSPDX = self.spdX;}
        if(self.spdY !=  self.LASTSPDY){obj.spdY = self.spdY;self.LASTSPDY = self.spdY;}
        if(self.timer !=  self.LASTTIMER){obj.timer = self.timer;self.LASTTIMER = self.timer;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;
        /*
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            hp:self.hp,
            angle:self.angle,
            spdX:self.spdX,
            spdY:self.spdY,

            timer:self.timer,
        }
        */
    }
    
    Minion.list[self.id] = self;
    initPack.minion.push(self.getInitPack());
    return self;
}
Minion.list = {};

Minion.update = function(){

    var pack = [];
    for(var i in Minion.list){
        var minion = Minion.list[i];
        minion.update();
        if(minion.toRemove){
            delete Minion.list[i];
            removePack.minion.push(minion.id);
        }else{
            pack.push(minion.getUpdatePack());
        }
    }
    return pack;
}
Minion.getAllInitPack = function(){
    var minions_ = [];
    for(var i in Minion.list){
        minions_.push(Minion.list[i].getInitPack());
    }
    return minions_;
}















Enemy = function(param){
    var self = Entity(param);
    self.id = Math.random();

    self.param = param;

    self.nome = param.nome;
    self.nomeI = param.nomeI;

    self.hp = param.hp;
    self.hpMax = param.hpMax;
    self.damage = param.damage;
    self.defence = param.defence;
    self.speed = param.speed;
    self.atkSpd = param.atkSpd;
    self.timeToAttack = param.timeToAttack;
    self.timeToSuperAttack = param.timeToSuperAttack;
    self.numShotSuperAttack = param.numShotSuperAttack; //DEVE sempre dispari!!!
    self.drops = param.drops;
    self.exp = param.exp;
    self.dungeon = param.dungeon;
    self.dungeonBoss = param.dungeonBoss;

    self.timerExit = 0;
    self.timerExitDungeon = 250;

    self.spawn_options = param.spawn_options;

    self.timeToRespawn = param.timeToRespawn;

    self.animation = param.animation;

    self.bulletSpeed = param.bulletSpeed;
    self.bulletTimeToRemove = param.bulletTimeToRemove;
    self.bulletImgSrc = param.bulletImgSrc;
    self.bulletFrWidth = param.bulletFrWidth || 1;
    self.bulletFrHeight = param.bulletFrHeight || 1;
    self.bulletRatio = param.bulletRatio || 1.5;
    self.bulletAnimationSpeed = param.bulletAnimationSpeed || 0;

    param.range = param.range || 200;
    param.range == "onScreen" ? self.range = 250 : self.range = param.range;
    
    self.angle = 0;
    self.attackCounter = 0;
    self.superAttackCounter = 0;

    self.target = false;

    self.toRemove = false;
    self.timer = 0;
    var super_update = self.update;

    self.update = function(){

        self.move();
        if(self.target) self.shotBullet();
        
        super_update();

        self.attackCounter += self.atkSpd;
        self.superAttackCounter++;

        for(var i in Bullet.list){
            var b = Bullet.list[i];
            if(self.map === b.map && self.getDistance(b) < 32 && b.type != "enemy"){
                //collision
                var shooter;
                if(Player.list[b.parent]) shooter = Player.list[b.parent];
                else if(Pet.list[b.parent]) shooter = Pet.list[b.parent];
                else if(Minion.list[b.parent]) shooter = Minion.list[b.parent];

                if(shooter){
                    //console.log(shooter);
                    var damage = randomNumber(0,2) + shooter.damage;
                    
                    //console.log("player:"+damage+", mob:"+self.nome,self.defence);

                    if(self.defence > damage){
                        self.hp -= 0.05;
                        CanvasText({msg:"-0.05", map:self.map, color:"red", x:self.x, y:self.y, entity:self});
                    }
                    else{
                        self.hp += (self.defence - damage);
                        CanvasText({msg:self.defence-damage, map:self.map, color:"red", x:self.x, y:self.y, entity:self});    
                    }
                }


                //console.log(self.hp, shooter.damage, damage);
                if(shooter == Pet.list[b.parent] && shooter && Player.list[shooter.parent]) shooter = Player.list[shooter.parent];
                if(shooter == Minion.list[b.parent] && shooter && Player.list[shooter.parent]) shooter = Player.list[shooter.parent];
                
                if(self.hp <= 0){
                    if(shooter)
                        shooter.score++;
                    self.onDeath(shooter);
                }

                b.toRemove = true;
            }
            else{
                for(var j in Player.list){
                    var p = Player.list[j];
                    if(b.map === p.map && b.getDistance(p) < 32 && b.type == "enemy" && !b.toRemove && b.parent == self.id){
                        //console.log("pg DEF:"+p.defence+", mob:"+self.nome,self.damage);

                        if(p.defence >= self.damage){
                            p.hp -= 0.1;
                            CanvasText({msg:"-0.1", map:p.map, color:"red", x:p.x, y:p.y, entity:p});
                        }
                        else{
                            p.hp += (p.defence - self.damage);
                            CanvasText({msg:p.defence-self.damage, map:p.map, color:"red", x:p.x, y:p.y, entity:p});
                        }

                        if(p.hp <= 0) p.onDeath();
                        b.toRemove = true;   
                    }
                }

                for(var j in Minion.list){
                    var p = Minion.list[j];
                    if(b.map === p.map && b.getDistance(p) < 32 && b.type == "enemy" && !b.toRemove && b.parent == self.id){

                        if(p.defence >= self.damage){
                            p.hp -= 0.1;
                            CanvasText({msg:"-0.1", map:p.map, color:"red", x:p.x, y:p.y, entity:p});
                        }
                        else{
                            p.hp += (p.defence - self.damage);
                            CanvasText({msg:p.defence-self.damage, map:p.map, color:"red", x:p.x, y:p.y, entity:p});
                        }

                        //console.log(p.hp);

                        if(p.hp <= 0) p.toRemove = true;
                        b.toRemove = true;   
                    }
                }
            }
        }
    }
    self.move = function(){

        //vedi il personaggio più vecino al mostro
        var min = null;
        for(var i in Player.list){
            let p = Player.list[i];
            
            if(min != null && self.map === p.map && self.getDistance(min) > self.getDistance(p)) min = p;
            else if(min === null) min = p;
        }

        for(var i in Minion.list){
            let m = Minion.list[i];
            
            if(min != null && self.map === m.map && self.getDistance(min) > self.getDistance(m)) min = m
            else if(min === null) min = m;
        }
        
        //muovi il mostro verso il persognaggio più vicino
        var p = min;
        if(p !== null){
            if(self.map === p.map && self.getDistance(p) < self.range /*&& self.parent !== p.id*/){
                if(self.getDistance(p) < 5){self.spdX = 0;self.spdY = 0;return;}
                
                self.target = true;

                var dx = p.x - self.x;
                var dy = p.y - self.y;
                var distance = Math.sqrt((dx*dx) + (dy*dy));
                self.angle = Math.atan2(dy,dx) * 180 / Math.PI;
                self.spdX = self.speed * (dx/distance);
                self.spdY = self.speed * (dy/distance);
            }else{
                self.target = false;
                self.spdX = 0;
                self.spdY = 0;
            } 
        }   
    }
    self.shotBullet = function(){
        if(self.attackCounter > self.timeToAttack && self.superAttackCounter < self.timeToSuperAttack){
            self.attackCounter = 0;
            Bullet({
                parent:self.id,
                angle:self.angle,
                x:self.x,
                y:self.y,
                map:self.map,
                type:"enemy",
                speed:self.bulletSpeed,
                timeToRemove:self.bulletTimeToRemove,
                imgSrc:self.bulletImgSrc,
                frWidth:self.bulletFrWidth,
                frHeight:self.bulletFrHeight,
                ratio:self.bulletRatio,
                animationSpeed:self.bulletAnimationSpeed
            });
        }

        if(self.superAttackCounter > self.timeToSuperAttack){
            self.superAttackCounter = 0;
            let amplifier = Math.floor(self.numShotSuperAttack-1/2);
            for(var i=0;i<self.numShotSuperAttack;i++)
                Bullet({
                    parent:self.id,
                    angle:self.angle-7*amplifier+i*7,
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    type:"enemy",
                    speed:self.bulletSpeed,
                    timeToRemove:self.bulletTimeToRemove,
                    imgSrc:self.bulletImgSrc,
                    frWidth:self.bulletFrWidth,
                    frHeight:self.bulletFrHeight,
                    ratio:self.bulletRatio,
                    animationSpeed:self.bulletAnimationSpeed
     
                });
        }
    }
    self.onDeath = function(p){

        p.missioni.addMostro(self.nomeI);

        /*
        *       *  
        * DROP  *
        *       *
        */

        if(randomNumber(0,100) <= 70){

            var numberDrops = randomNumber(0,self.drops.length-1);
            var numberReleased = [];

            var numberDropsLoop = Math.round(numberDrops * global_config.DROP/100);

            for(var i=0; i<numberDropsLoop; i++){
                var id = 0;
                if(numberDropsLoop < self.drops.length-1){
                    var continua = true;
                    while(continua){
                        continua = false;
                        id = randomNumber(0,numberDrops);

                        for(var j in numberReleased) 
                            if(numberReleased[j] == id) 
                                continua = true;    
                    }
                }else id = randomNumber(0,numberDrops);

                numberReleased.push(id);
                var chance = randomNumber(0, 100);
                var itemDropped = self.drops[id]
                
                if(chance <= itemDropped.percentuale){
                    var quantita = randomNumber(itemDropped.quantitaMin, itemDropped.quantitaMax);
                    var item = search_name(itemDropped.nome, items); 

                    Drop({
                        x: self.x,
                        y: self.y,
                        map: self.map,
                        nome: itemDropped.nome,
                        item: item,
                        quantita: quantita
                    });
                }
            }

        
        }


        /*
        *       *  
        *  EXP  *
        *       *
        */

        //let mob_exp = (self.exp * global_config.EXP/100) / (p.livello);
        p.group.addExpGroup(self.exp);


        /*
        *           *  
        *  DUNGEON  *
        *           *
        */

        for(var i in self.dungeon){
            var hasDungeon = randomNumber(0,100);
            if(hasDungeon <= global_config.DUNGEON){
                if(randomNumber(0,100) <= self.dungeon[i].percentuale){
                    let d = search_name(self.dungeon[i].nome, dungeons);

                    let d_name = Math.random();
                    d.nome = d.nome+""+d_name;

                    d.map = self.map;
                    d.x = self.x;
                    d.y = self.y;
                    
                    Dungeon(d);
                    break;
                }
            }
        }



        /*
        *           *  
        *  RESPAWN  *
        *           *
        */
        

        if(!self.dungeonBoss) Enemy.died[self.id] = self;
        else{
            for(var i in Player.list){
                let p = Player.list[i];
                if(p.map == self.map)
                    p.socket.emit("addToChat", "Sarai teletrasportato in citta tra 10 secondi!");
            }
            Enemy.exit[self.id] = self;
        }
        self.toRemove = true;
  
    }
    self.spawn = function(){
        self.x = randomNumber(self.spawn_options.x, self.spawn_options.xMax);
        self.y = randomNumber(self.spawn_options.y, self.spawn_options.yMax);
    }

    self.spawn();


    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            hp:self.hp,
            hpMax:self.hpMax,
            angle:self.angle,

            animation:self.animation,
        };
    }
    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}
        if(self.hp !=  self.LASTHP){obj.hp = self.hp;self.LASTHP = self.hp;}
        if(self.angle !=  self.LASTANGLE){obj.angle = self.angle;self.LASTANGLE = self.angle;}
        if(self.spdX !=  self.LASTSPDX){obj.spdX = self.spdX;self.LASTSPDX = self.spdX;}
        if(self.spdY !=  self.LASTSPDY){obj.spdY = self.spdY;self.LASTSPDY = self.spdY;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;
        /*
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            angle:self.angle,
            spdX:self.spdX,
            spdY:self.spdY,
        }
        */
    }
    
    Enemy.list[self.id] = self;
    initPack.enemy.push(self.getInitPack());
    return self;
}
Enemy.list = {};
Enemy.died = {};
Enemy.exit = {};
Enemy.update = function(){

    for(var i in Enemy.died){
        var enemy = Enemy.died[i];
        if(enemy.timer++>enemy.timeToRespawn){
            enemy.spawn();
            Enemy(enemy.param);

            delete Enemy.died[i];
        }

    }

    for(var i in Enemy.exit){
        var enemy = Enemy.exit[i];
        if(enemy.dungeonBoss && enemy.timerExit++>enemy.timerExitDungeon){
            for(var i in Player.list){
                let p = Player.list[i];
                if(p.map == enemy.map){
                    let data = search_name("Citta",maps); 
                    p.map = data.nome;
                    p.map_options = data;
                    p.spawn();

                    for(var i in Pet.list) if(Pet.list[i].parent == p.id) Pet.list[i].map = data.nome;
                    p.mondo.changeMap(p.map_options);
                }
            }
            delete Enemy.exit[i];
        }  
    }

    var pack = [];
    for(var i in Enemy.list){
        var enemy = Enemy.list[i];
        enemy.update();
        if(enemy.toRemove){
            delete Enemy.list[i];
            removePack.enemy.push(enemy.id);
        }else{
            pack.push(enemy.getUpdatePack());
        }
    }
    return pack;
}
Enemy.getAllInitPack = function(){
    var enemys = [];
    for(var i in Enemy.list){
        enemys.push(Enemy.list[i].getInitPack());
    }
    return enemys;
}

Player = function(param){
    var self = Entity(param);
    self.username = param.username;
    self.email = param.email;

    let hero = param.hero;

    self.maxSpd = hero.maxSpd;
    self.hp = hero.hp;
    self.hpMax = hero.hpMax;
    self.mp = hero.mp;
    self.mpMax = hero.mpMax;
    self.regHp = hero.regHp;
    self.regMp = hero.regMp;

    self.x = hero.x;
    self.y = hero.y;

    self.damage = hero.damage;
    self.defence = hero.defence;
    self.score = hero.score;
    self.atkSpd = hero.atkSpd;
    self.livello = hero.livello;
    self.class = hero.class;
    self.esperienza = hero.esperienza;
    self.gold = hero.gold;
    self.gemme = hero.gemme;
    self.map = param.map.nome;
    self.map_options = param.map;
    
    self.colorText = "#ff7400";
    self.puntiStat = hero.puntiStat;

    self.animation = hero.animation;

    self.bulletSpeed = hero.bulletSpeed;
    self.bulletTimeToRemove = hero.bulletTimeToRemove;
    self.bulletImgSrc = hero.imgBullet;
    self.bulletFrWidth = param.bulletFrWidth || 1;
    self.bulletFrHeight = param.bulletFrHeight || 1;
    self.bulletRatio = param.bulletRatio || 1.5;
    self.bulletAnimationSpeed = param.bulletAnimationSpeed || 0;

    self.timeToAttack = hero.timeToAttack;
    self.timeToSuperAttack = hero.timeToSuperAttack;
    self.numShotSuperAttack = hero.numShotSuperAttack; //DEVE sempre dispari!!!

    //console.log(param.progress.equip);
    self.inventory = new Inventory(param.progress.items, param.socket, true, param.progress.inventory, param.progress.equip, param.progress.short_inv);
    self.mondo = new Mondo({socket:param.socket,mondo:self.map_options,server:true});
    self.group = new Group({socket:param.socket,server:true, name:param.username});
    self.trade = new Trade({socket:param.socket,server:true, name:param.username});

    //console.log(param.progress.missioni);

    self.missioni = new Missioni({socket:param.socket,missioni:param.progress.missioni.missioni || [],missioniCompletate:param.progress.missioni.missioniCompletate || [],mostri:param.progress.missioni.mostri || [],server:true});
    self.mostriKilled = [];

    var negozi = [];
    for(var i in NPC.list){
        let n = NPC.list[i];
        negozi[n.nome] = n.negozio;
        //console.log(negozi);
    }

    self.NPCNeg = new NPCNegozio({socket:param.socket,server:true,lastNeg:null,nome:null,closeAll:true,negozi:negozi});

    self.pet = hero.pet; /*{nome:"GaglinaChioccia", livello:0, magia:/*{nome:"Acido",livello:0}*null};*/

    self.skill = [];
    self.skillPass = [];

    self.number = ""+Math.floor(Math.random()*10);
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.collectItem = false;
    self.collectItemPet = false;
    self.mouseAngle = 0;
    self.attackCounter = 0;
    self.usingSkill = false;

    self.timeToRegenerate = 20;
    self.timerToRegenerate = 0;
    
    var super_update = self.update;
    self.update = function(){
        self.updateSpd();

        //width pg = 64, height pg = 64
        
        var rect1 = {
			x: self.x+self.spdX-16,
			y: self.y+self.spdY-16,
			width: 32,
			height: 32,
        }

        var continua = true;
        let map_collision = self.map_options.Collision;
        
        if(map_collision){

            var x=0, y=0;
            for(var i=0;i<map_collision.data.length;i++){
                let collision_block = map_collision.data[i];

                if(collision_block){
                 
                    var rect2 = {
                        x: x*32,
                        y: y*32,
                        width: 32,
                        height: 32,
                    }

                    if(testCollisionRectRect(rect1,rect2)){
                        continua = false;
                        break;
                    }
                }
                x++; 
                if(x>=map_collision.width){x=0;y++}
            }

        }


        if(continua) super_update();


        let minX_p = self.x - 64,
            maxX_p = self.x + 64,
            minY_p = self.y - 64,
            maxY_p = self.y + 64;


        let c = true;   
        for(var i in NPC.list){
            if(NPC.list[i].x>=minX_p && NPC.list[i].x<=maxX_p && NPC.list[i].y>=minY_p && NPC.list[i].y<=maxY_p && NPC.list[i].map == self.map){

                self.NPCNeg.nome = NPC.list[i].nome;

                self.NPCNeg.refreshRender();
                self.NPCNeg.lastNeg = NPC.list[i].nome;
                self.NPCNeg.closeAll = false; 
                
                c=false;
                break;
            }
        }
        if(c) self.NPCNeg.closeAll = true;  
        
        self.NPCNeg.refreshRender();

        self.missioni.update();


        if(self.timerToRegenerate++>self.timeToRegenerate){
            let hp_reg = self.hp + self.regHp;
            hp_reg >= self.hpMax ? self.hp = self.hpMax : self.hp = hp_reg;
            
            let mp_reg = self.mp + self.regMp;
            mp_reg >= self.mpMax ? self.mp = self.mpMax : self.mp = mp_reg;
        
            self.timerToRegenerate = 0;
        }

        self.attackCounter+=self.atkSpd;

        if(self.pressingAttack && self.attackCounter>self.timeToAttack){
            /*for(var i = -3; i<3; i++)
                self.shotBullet(i*10+self.mouseAngle);
            */
            
            self.attackCounter = 0;
            self.shotBullet(self.mouseAngle);
        }
    }
    self.shotBullet = function(angle){
        //if(Math.random()<0.1) self.inventory.addItem("potion",1);
        Bullet({
            parent:self.id,
            angle:angle,
            x:self.x,
            y:self.y,
            map:self.map,
            speed:self.bulletSpeed,
            timeToRemove:self.bulletTimeToRemove,
            imgSrc:self.bulletImgSrc,
            damageMin:self.damageMin,
            damageMax:self.damageMax,
            frWidth:self.bulletFrWidth,
            frHeight:self.bulletFrHeight,
            ratio:self.bulletRatio,
            animationSpeed:self.bulletAnimationSpeed

        });
    }
    self.onDeath = function(){
        self.hp = self.hpMax;
        self.spawn();
    }
    self.updateSpd = function(){

        if(self.pressingRight) self.spdX = self.maxSpd;
        else if(self.pressingLeft) self.spdX = -self.maxSpd;
        else self.spdX = 0;

        if(self.pressingUp) self.spdY = -self.maxSpd;
        else if(self.pressingDown) self.spdY = self.maxSpd;
        else self.spdY = 0;

    }
    self.spawn = function(){
        let allSpawn = [];

        for(var i in self.map_options.Object){
            let obj = self.map_options.Object[i];
            //console.log(obj)
            if(obj.name == "Spawn" && obj.type == "Player"){
                allSpawn.push(obj);
            }
        }

        let n = randomNumber(0, allSpawn.length-1);
        
        let obj = allSpawn[n];
        self.x = randomNumber(obj.x,obj.x+obj.width);
        self.y = randomNumber(obj.y,obj.y+obj.height);
        
    }
    if((self.x==500 && self.y==500) || !self.x || !self.y) self.spawn();

    self.changeClass = function(className){
        self.class = className;

        let an = search_name(className, heroes);
        self.animation = an.animation;

    }

    self.addExp = function(mob_exp){
        
        self.esperienza += mob_exp;
        CanvasText({msg:Math.round(mob_exp*10)/10, map:self.map, color:"#22ff00", x:self.x, y:self.y, entity:self});

        while(self.esperienza >= 100){
            self.esperienza -= 100;
            self.livello++;
            self.puntiStat+=2;
            self.addQuest();

            var a = search_name("LevelUp", skills);
            a.x = self.x;
            a.y = self.y;
            a.map = self.map;
            a.target = self;
            Abilita(a);

            CanvasText({msg:"Level up!", map:self.map, color:"blue", x:self.x, y:self.y, entity:self});
        }
    }

    self.addSkill = function(nome, livello){

        let add = true;
        for(var i in self.skill){
            if(self.skill[i].nomeI == nome){
                add = false;
            }
        }

        if(add){
            let a = search_name(nome, skills);
            if(livello){
                let m = a.miglioramenti[livello];
                a.mpUsed = m.mpUsed;
                a.timeToReuse = m.timeToReuse;
                a.timeEffect = m.timeEffect;
                a.bonus = m.bonus;
                a.range = m.range;
                a.ratio = m.ratio;
                a.numeroColpi = m.numeroColpi;
                a.livello = livello;
            }
            a.nomeI = nome;

            a.commento_dettagliato = "<span class='titoloSkill'>"+a.commento+"</span><br><br>livello: "+a.livello+"<br>mp utilizzati: "+a.mpUsed+"<br>durata effetto: "+a.timeEffect/1000+" sec.<br>tempo ricarica: "+a.timeToReuse/1000+" sec.<br>range: "+a.range+"px <br>colpi: "+a.numeroColpi+"<br>bonus: +"+a.bonus.hp+" hp, +"+a.bonus.mp+" mp, +"+a.bonus.damage+" atk, +"+a.bonus.defence+" def, +"+a.bonus.regHp+" regHp, +"+a.bonus.regMp+" regMp <br><br><span class='spiegazioneSkill'>"+a.spiegazione+"</span>";

            if(a.classe == self.class){
                self.skill.push(a);
                self.skillPass.push({
                    nome: a.nomeI,
                    imgInv: a.imgInv,
                    commento: a.commento,
                    commento_dettagliato: a.commento_dettagliato,
                    livello: a.livello
                });

                self.ability.refreshAbility(self.skillPass);
            }
            else self.socket.emit("alert", "Non puoi utlizzare questa abilità!");
            //console.log(a);
        }else self.socket.emit("alert", "Abilità già imparata!");
    }

    self.addPet = function(pet_){
        self.pet = pet_;

        let p = search_name(pet_.nome, pets);
        p.livello = pet_.livello;
        p.magia = pet_.magia;

        for(var i in p.miglioramenti){
            if(i == p.livello){
                p.bonus = p.miglioramenti[i].bonus;
                p.range = p.miglioramenti[i].range;
                p.speed = p.miglioramenti[i].speed;
                p.abilita = p.miglioramenti[i].abilita;
                break;
            }
        }
        p.map = self.map;
        p.x = self.x;
        p.y = self.y;
        p.parent = self.id;
        Pet(p);

        if(self.stalliere) self.stalliere.refreshPet(self.pet);
    }
    self.removePet = function(){
        for(var i in Pet.list)
            if(Pet.list[i].parent == self.id)
                Pet.list[i].toRemove = true;
            
        self.pet = undefined;
    }

    self.addMinion = function(param){

        param = param || {};
        param.minion = param.minion || "OcchioGiallo";

        let m = search_name(param.minion, minions);
        m.map = self.map;
        m.parent = self.id;

        if(!param.x) m.x = self.x;
        else m.x = param.x;

        if(!param.y) m.y = self.y;
        else m.y = param.y;

        Minion(m);
    }
    //for(var i=0;i<10;i++) self.addMinion({minion:"OcchioGiallo", x:100*Math.cos(36*i)+self.x, y:100*Math.sin(36*i)+self.y});
    self.addMinion();

    if(self.pet){
        self.addPet(self.pet);

        self.stalliere = new Stalliere({socket:param.socket, server:true, pet:true, id:self.id});
    }else self.stalliere = new Stalliere({socket:param.socket, server:true, pet:false, id:self.id});


    
    self.ability = new Ability({socket:param.socket, skill:self.skillPass, server:true});

    for(var i in param.progress.skill){
        let sk = param.progress.skill[i];
        self.addSkill(sk.nome, sk.livello);
    }

    self.addQuest = function(){
        let miss = search_name(self.livello, quests);
        if(miss){
            miss.id = self.livello;
            self.missioni.add(miss);
        }
    }

    if(self.livello == 0) self.addExp(100);


    self.getInitPack = function(){
        return {
            id:self.id, 
            x:self.x,
            y:self.y,
            number:self.number,
            username:self.username,
            hp:self.hp,
            hpMax:self.hpMax,
            mp:self.mp,
            mpMax:self.mpMax,
            exp:self.esperienza,
            livello:self.livello,
            gold:self.gold,
            defence: self.defence,
            damage: self.damage,
            regHp: self.regHp,
            regMp: self.regMp,
            puntiStat: self.puntiStat,
            gemme:self.gemme,
            score:self.score,
            map:self.map,
            map_options:self.map_options,
            angle:self.mouseAngle,
            colorText:self.colorText,

            animation:self.animation
        }
    }
    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}
        if(self.hp !=  self.LASTHP){obj.hp = self.hp;self.LASTHP = self.hp;}
        if(self.hpMax !=  self.LASTHPMAX){obj.hpMax = self.hpMax;self.LASTHPMAX = self.hpMax;}
        if(self.mp !=  self.LASTMP){obj.mp = self.mp;self.LASTMP = self.mp;}
        if(self.mpMax !=  self.LASTMPMAX){obj.mpMax = self.mpMax;self.LASTMPMAX = self.mpMax;}

        if(self.esperienza !=  self.LASTEXP){obj.exp = self.esperienza;self.LASTEXP = self.esperienza;}
        if(self.livello !=  self.LASTLIVELLO){obj.livello = self.livello;self.LASTLIVELLO = self.livello;}
        if(self.gold !=  self.LASTGOLD){obj.gold = self.gold;self.LASTGOLD = self.gold;}
        if(self.defence !=  self.LASTDEFENCE){obj.defence = self.defence;self.LASTDEFENCE = self.defence;}
        if(self.damage !=  self.LASTDAMAGE){obj.damage = self.damage;self.LASTDAMAGE = self.damage;}
        if(self.regHp !=  self.LASTREGHP){obj.regHp = self.regHp;self.LASTREGHP = self.regHp;}
        if(self.regMp !=  self.LASTREGMP){obj.regMp = self.regMp;self.LASTREGMP = self.regMp;}
        if(self.puntiStat !=  self.LASTPUNTISTAT){obj.puntiStat = self.puntiStat;self.LASTPUNTISTAT = self.puntiStat;}
        if(self.gemme !=  self.LASTGEMME){obj.gemme = self.gemme;self.LASTGEMME = self.gemme;}
        if(self.score !=  self.LASTSCORE){obj.score = self.score;self.LASTSCORE = self.score;}
        if(self.map !=  self.LASTMAP){obj.map = self.map;self.LASTMAP = self.map;}
        if(self.mouseAngle !=  self.LASTMOUSEANGLE){obj.mouseAngle = self.mouseAngle;self.LASTMOUSEANGLE = self.mouseAngle;}

        if(self.spdX !=  self.LASTSPDX){obj.spdX = self.spdX;self.LASTSPDX = self.spdX;}
        if(self.spdY !=  self.LASTSPDY){obj.spdY = self.spdY;self.LASTSPDY = self.spdY;}
        if(self.animation !=  self.LASTANIMATION){obj.animation = self.animation;self.LASTANIMATION = self.animation;}
        if(self.colorText !=  self.LASTCOLORTEXT){obj.colorText = self.colorText;self.LASTCOLORTEXT = self.colorText;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;

        /*
        return {
            id:self.id, 
            x:self.x,
            y:self.y,
            hp:self.hp,
            hpMax:self.hpMax,
            mp:self.mp,
            mpMax:self.mpMax,
            exp:self.esperienza,
            livello:self.livello,
            gold:self.gold,
            defence: self.defence,
            damage: self.damage,
            regHp: self.regHp,
            regMp: self.regMp,
            puntiStat: self.puntiStat,
            gemme:self.gemme,
            score:self.score,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spdX:self.spdX,
            spdY:self.spdY,

            animation:self.animation
        }
        */
    }
    Player.list[self.id] = self;

    initPack.player.push(self.getInitPack());

    return self;
}
Player.list = {};
Player.onConnect = function(socket, username, email, progress, hero_options, map){
       
    var player = Player({
        username:username,
        email:email,
        id:socket.id,
        map:map,
        socket:socket,
        progress:progress,
        hero:hero_options
    });
    player.inventory.refreshRender();

    socket.emit("addToChat", "Benvenuto "+username+"!");

    socket.on('keyPress', function(data){
        if(data.inputId === "left")
            player.pressingLeft = data.state;
        else if(data.inputId === "right")
            player.pressingRight = data.state;
        else if(data.inputId === "up")
            player.pressingUp = data.state;
        else if(data.inputId === "down")
            player.pressingDown = data.state;
        else if(data.inputId === "attack")
            player.pressingAttack = data.state;
        else if(data.inputId === "mouseAngle")
            player.mouseAngle = data.state;
        
        if(data.inputId === "collectItem"){
            player.collectItem = data.state;
            player.collectItemPet = data.state;
        }
    });

    socket.on('changeMap',function(data){
        var m = search_name(data,maps);

        if(player.gold >= m.monete){
            if(player.gemme >= m.gemme){
                if(player.livello >= m.livelloMin){
                    if(player.livello <= m.livelloMax){
                        if(player.map != data){
                            socket.emit("confirm", 
                                {
                                    msg:"Sei sicuro di voler andare in "+data+" per "+m.monete+" monete e "+m.gemme+" gemme?", 
                                    emit:{
                                        nome:"verificaChangeMap",
                                        bool:true
                                    },
                                    data: m
                                }
                            );
                        }else socket.emit("alert", "Sei già in questa mappa!");
                    }else socket.emit("alert", "Livello troppo alto. Livello massimo: "+m.livelloMax);
                }else socket.emit("alert", "Livello troppo basso. Livello richiesto: "+m.livelloMin);
            }else socket.emit("alert", "Non hai abbastanza gemme! (ne servono "+m.gemme+")");
        }else socket.emit("alert", "Non hai abbastanza gold! (ne servono "+m.monete+")");

    });
    socket.on('verificaChangeMap', function(data){
        //console.log("change map");
        player.gold-=data.monete;
        player.gemme-=data.gemme;
        player.map = data.nome;
        player.map_options = data;
        player.spawn();

        for(var i in Pet.list) if(Pet.list[i].parent == player.id) Pet.list[i].map = data.nome;
        
        player.mondo.changeMap(data);
    })

    socket.on('compraItem',function(data){
        if(player.gold >= data.monete){
            if(player.gemme >= data.gemme){
                socket.emit("confirm", 
                    {
                        msg:"Sei sicuro di voler comprare "+data.item.nome+" per "+data.monete+" monete e "+data.gemme+" gemme?", 
                        emit:{
                            nome:"verificaCompraItem",
                            bool:true
                        },
                        data: data
                    }
                );
                      
            }else socket.emit("alert", "Non hai abbastanza gemme! (ne servono "+data.gemme+")");    
        }else socket.emit("alert", "Non hai abbastanza gold! (ne servono "+data.monete+")");
    });
    socket.on('verificaCompraItem', function(data){
        player.inventory.addItem(data.id, data.item, data.amount, function(){
            player.gold-=data.monete;
            player.gemme-=data.gemme;
            player.inventory.refreshRender();
        });
    });
    
    socket.on('miglioraStat',function(data){
        //console.log("migliora");
        if(data=="hpMax") player.hpMax+=1;
        else if(data=="mpMax") player.mpMax+=1;
        else if(data=="defence") player.defence = Math.round(player.defence*100+5)/100;
        else if(data=="damage") player.damage = Math.round(player.damage*100+5)/100;
        else if(data=="regHp") player.regHp = Math.round(player.regHp*100+5)/100;
        else if(data=="regMp") player.regMp = Math.round(player.regMp*100+5)/100;
        
        player.puntiStat--;
    });

    socket.on('sendMsgToServer', function(data){
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit("addToChat", player.username + ": " + data);
        }
    });
    socket.on('sendPmToServer', function(data){
        var recipientSocket = null;
        for(var i in Player.list)
            if(Player.list[i].username === data.username)
                recipientSocket = SOCKET_LIST[i];

        if(recipientSocket == null) socket.emit("addToChat", "Il giocatore "+data.username+" non è online.");
        else{
            recipientSocket.emit("addToChat", "Da "+player.username+":"+ data.message);
            socket.emit("addToChat", "A "+data.username+":"+ data.message);
        }
    });


    socket.on("verificaEnterDungeon", function(data){

        var dungeon, player;

        for(var i in Dungeon.list) if(Dungeon.list[i].id == data.dungeon) dungeon = Dungeon.list[i];
        for(var i in Pet.list) if(Pet.list[i].parent == data.player) Pet.list[i].map = dungeon.nome;
        for(var i in Player.list) if(Player.list[i].id == data.player) player = Player.list[i];

        dungeon.numberPlayerIn++;

        player.map = dungeon.nome;
        player.map_options = dungeon.dungeon_options;

        player.mondo.changeMap(player.map_options);
        player.spawn();
    });

    socket.on("removeAbility", function(data){
        for(var i in Abilita.list)
            if(Abilita.list[i].id === data)
                Abilita.list[i].toRemove = true;
    });


    socket.emit('init',{
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
        enemy:Enemy.getAllInitPack(),
        pet:Pet.getAllInitPack(),
        minion:Minion.getAllInitPack(),
        drop:Drop.getAllInitPack(),
        abilita:Abilita.getAllInitPack(),
        dungeon:Dungeon.getAllInitPack(),
        npc:NPC.getAllInitPack(),
        canvasText:CanvasText.getAllInitPack()
    });
}
Player.getAllInitPack = function(){
    var players = [];
    for(var i in Player.list){
        players.push(Player.list[i].getInitPack());
    }
    return players;
}
Player.onDisconnect = function(socket){
    let player = Player.list[socket.id];
    if(!player) return;
    console.log("Player disconected: "+player.email);


    player.group.removeFromGroup(player.username);
    player.trade.closeTrade();


    let pl_inv = player.inventory.items;
    let pl_sh_inv = player.inventory.short_inv;
    let pl_eq = player.inventory.equip;
    let pl_sk = player.skill;
    let pl_ms = player.missioni;


    let miss=[];
    for(var i in pl_ms.missioni) miss.push(pl_ms.missioni[i].id);
    
    data_miss = {missioni:miss, missioniCompletate:pl_ms.missioniCompletate, mostri:pl_ms.mostri};

    
    let data_items = [];
    for(var i in pl_inv)
        data_items.push({id:pl_inv[i].id, amount: pl_inv[i].amount});
    
    let data_short_inv = [];
    for(var i in pl_sh_inv)
        data_short_inv.push({id:pl_sh_inv[i].id, amount: pl_sh_inv[i].amount});
    
    let data_skill = [];
    for(var i in pl_sk)
        data_skill.push({nome:pl_sk[i].nomeI, livello: pl_sk[i].livello});
    
    let data_equip = {};
    pl_eq.arma != null ? data_equip.arma = pl_eq.arma.id : data_equip.arma = null;
    pl_eq.elmo != null ? data_equip.elmo = pl_eq.elmo.id : data_equip.elmo = null;
    pl_eq.armatura != null ? data_equip.armatura = pl_eq.armatura.id : data_equip.armatura = null;
    pl_eq.collana != null ? data_equip.collana = pl_eq.collana.id : data_equip.collana = null;
    pl_eq.anello != null ? data_equip.anello = pl_eq.anello.id : data_equip.anello = null;
    
    let data_hero = {};
    data_hero.maxSpd = player.maxSpd;
    data_hero.hp = player.hp;
    data_hero.hpMax = player.hpMax;
    data_hero.mp = player.mp;
    data_hero.mpMax = player.mpMax;
    data_hero.damage = player.damage;
    data_hero.defence = player.defence;
    data_hero.score = player.score;
    data_hero.atkSpd = player.atkSpd;
    data_hero.livello = player.livello;
    data_hero.esperienza = player.esperienza;
    data_hero.gold = player.gold;
    data_hero.map = player.map;
    data_hero.x = player.x;
    data_hero.y = player.y;

    data_hero.pet = player.stalliere.getPet();
    //data_hero.pet = player.pet;

    data_hero.regHp = player.regHp;
    data_hero.regMp = player.regMp;
    data_hero.puntiStat = player.puntiStat;

    data_hero.gemme = player.gemme;
    data_hero.class = player.class;
    data_hero.bulletSpeed = player.bulletSpeed;
    data_hero.bulletTimeToRemove = player.bulletTimeToRemove;
    data_hero.imgBullet = player.bulletImgSrc;
    data_hero.bulletFrWidth = player.bulletFrWidth,
    data_hero.bulletFrHeight = player.bulletFrHeight,
    data_hero.bulletRatio = player.bulletRatio,
    data_hero.bulletAnimationSpeed = player.bulletAnimationSpeed,

    data_hero.timeToAttack = player.timeToAttack;
    data_hero.timeToSuperAttack = player.timeToSuperAttack;
    data_hero.numShotSuperAttack = player.numShotSuperAttack;

    Database.savePlayerProgress({
        items: data_items,
        equip: data_equip,
        hero: data_hero,
        email: player.email,
        short_inv: data_short_inv,
        skill: data_skill,
        missioni: data_miss
    });
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function(){
    var pack = [];
    for(var i in Player.list){
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}

Bullet = function(param){
    var self = Entity(param);

    param.speed = param.speed || 10;

    self.id = Math.random();
    self.angle = param.angle;
    self.spdX = Math.cos(param.angle/180*Math.PI) * param.speed;
    self.spdY = Math.sin(param.angle/180*Math.PI) * param.speed;
    self.parent = param.parent;
    self.timeToRemove = param.timeToRemove || 50;
    self.type = param.type || ""; 

    self.imgSrc = param.imgSrc;
    self.damageMin = param.damageMin || 1;
    self.damageMax = param.damageMax || 3;

    self.frWidth = param.frWidth;
    self.frHeight = param.frHeight;
    self.ratio = param.ratio;
    self.animationSpeed = param.animationSpeed;


    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > self.timeToRemove)
            self.toRemove = true;
        super_update();

        if(PVP){
            for(var i in Player.list){
                var p = Player.list[i];
                if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
                    //collision
                    p.hp--;
                    
                    if(p.hp <= 0){
                        var shooter = Player.list[self.parent];
                        if(shooter)
                            shooter.score++;
                        p.hp = p.hpMax;
                        p.x = Math.random()*500;
                        p.y = Math.random()*500;
                    }
        
                    self.toRemove = true;
                }
            }
        }
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            imgSrc:self.imgSrc,
            frWidth: self.frWidth,
            frHeight: self.frHeight,
            ratio: self.ratio,
            animationSpeed: self.animationSpeed
        };
    }
    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;
        /*
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
        */
    }
    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
}
Bullet.list = {};
Bullet.update = function(){

    var pack = [];
    for(var i in Bullet.list){
        var bullet = Bullet.list[i];
        bullet.update();
        if(bullet.toRemove){
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        }else{
            pack.push(bullet.getUpdatePack());
        }
    }
    return pack;
}
Bullet.getAllInitPack = function(){
    var bullets = [];
    for(var i in Bullet.list){
        bullets.push(Bullet.list[i].getInitPack());
    }
    return bullets;
}

Drop = function(param){
    var self = Entity(param);

    self.id = Math.random();
    self.timeToRemove = 1400; // 1 minuto

    self.x = randomNumber(param.x-5, param.x+5);
    self.y = randomNumber(param.y-5, param.y+5);
    self.map = param.map;

    self.nome = param.nome;
    self.item = param.item;
    self.imgSrc = param.item.imgInv;
    self.quantita = param.quantita;
    self.type = param.type || ""; 

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        //console.log(self.timer);
        if(self.timer++ > self.timeToRemove)
            self.toRemove = true;
        super_update();

        for(var i in Player.list){
            var p = Player.list[i],
                pet_p;

            for(var j in Pet.list){
                var pe = Pet.list[j];

                if(pe.parent == p.id){
                    pet_p = pe;
                    break;
                }
            }

            if((self.map === p.map && self.getDistance(p) < 64 && p.collectItem) || (pet_p && self.map === p.map && self.getDistance(pet_p) < 64 && p.collectItem)){
                //collision
                self.toRemove = true;

                if(self.nome.slice(0,6) == "Moneta"){
                    p.gold += self.item.valore*self.quantita;
                }
                else if(self.nome.slice(0,5) == "Gemma"){
                    p.gemme += self.item.valore*self.quantita;
                }else p.inventory.addItem(self.nome, self.item, self.quantita);

            }
        }
        
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            imgSrc:self.imgSrc,
        };
    }

    self.getUpdatePack = function(){
        return {};
    }
    Drop.list[self.id] = self;
    initPack.drop.push(self.getInitPack());
    return self;
}
Drop.list = {};
Drop.update = function(){

    var pack = [];
    for(var i in Drop.list){
        var drop = Drop.list[i];
        drop.update();
        if(drop.toRemove){
            delete Drop.list[i];
            removePack.drop.push(drop.id);
        }else{
            pack.push(drop.getUpdatePack());
        }
    }
    return pack;
}
Drop.getAllInitPack = function(){
    var drops = [];
    for(var i in Drop.list){
        drops.push(Drop.list[i].getInitPack());
    }
    return drops;
}


Abilita = function(param){
    var self = Entity(param);

    self.id = Math.random();

    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.parent = param.parent;
    self.target = param.target;
    self.targets = param.targets;
    self.nome = param.nome;
    self.nomeI = param.nomeI;
    self.mpUsed = param.mpUsed
    self.timeToReuse = param.timeToReuse;
    self.timeEffect = param.timeEffect;
    self.class = param.classe;
    self.function = new Function(param.function.arguments, param.function.body);
    self.commento = param.commento;
    self.miglioramenti = param.miglioramenti;
    self.bonus = param.bonus;
    self.numeroColpi = param.numeroColpi;
    self.option = param.option;
    self.ratio = param.ratio;
    self.petParent = param.petParent;
    
    self.img = param.animation.img;
    self.animationSpeed = param.animation.animationSpeed;
    self.frWidth = param.animation.frWidth;
    self.frHeight = param.animation.frHeight;
    self.loop = param.animation.loop;

    self.timer = 0;
    self.timer2 = 0;
    self.toRemove = false;

    if(self.timeEffect != 0) self.function({p:self.target, parent:self.parent, sk:self, petParent:self.petParent});

    var super_update = self.update;
    self.update = function(){
        //console.log(self.timer);
        if(self.timeToRemove && self.timer++ > self.timeToRemove)
            self.toRemove = true;
        super_update();

        if(self.timeEffect == 0){
            self.timeEffect--;
            self.function({p:self.target, parent:self.parent, sk:self, petParent:self.petParent});
        }

        if(self.option.type == "self" || self.option.type == "player"){
            for(var i in Player.list){
                var p = Player.list[i];
                if(p.id == self.target.id){
                    self.x = p.x + self.option._x;
                    self.y = p.y + self.option._y;
                }
            }
        }else if(self.option.type == "enemy"){
            for(var i in Enemy.list){
                var e = Enemy.list[i];
                if(self.target != null && e.id == self.target.id){
                    self.x = e.x + self.option._x;
                    self.y = e.y + self.option._y;
                }
            }
        }else if(self.option.type == "player_collision"){
            for(var i in Player.list){
                var p = Player.list[i];
                if(p.id == self.parent.id){
                    self.x = p.x + self.option._x;
                    self.y = p.y + self.option._y;
                }
            }
        }
        /*else if(self.option.type == "enemy_collision"){
            for(var i in Enemy.list){
                var e = Enemy.list[i];
                for(var j in self.targets){
                    let t = self.targets[j];
                    if(e.id == t.id){
                        //self.x = e.x + self.option._x;
                        //self.y = e.y + self.option._y;
                    }
                }
            }
        }*/
        
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            img:self.img,
            animationSpeed: self.animationSpeed,
            frWidth: self.frWidth,
            frHeight: self.frHeight,
            ratio: self.ratio,
            loop: self.loop
        };
    }

    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;
        /*
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
        */
    }

    Abilita.list[self.id] = self;
    Abilita.used[self.id] = self;
    initPack.abilita.push(self.getInitPack());
    return self;
}
Abilita.list = {};
Abilita.used = {};
Abilita.update = function(){

    var pack = [];
    for(var i in Abilita.list){
        var abilita = Abilita.list[i];
        abilita.update();
        if(abilita.toRemove){
            removePack.abilita.push(abilita.id);
            delete Abilita.list[i];
        }else{
            pack.push(abilita.getUpdatePack());
        }
    }

    for(var i in Abilita.used){
        var abilita = Abilita.used[i];
        abilita.timer2++;
        if(abilita.parent && abilita.parent.ability) abilita.parent.ability.refreshShadow({nome:abilita.nomeI,timer2:abilita.timer2, timeToReuse:abilita.timeToReuse});
        if(abilita.timer2>abilita.timeToReuse)
            delete Abilita.used[i];
    }
    return pack;
}
Abilita.getAllInitPack = function(){
    var abilitas = [];
    for(var i in Abilita.list){
        abilitas.push(Abilita.list[i].getInitPack());
    }
    return abilitas;
}



Dungeon = function(param){
    var self = Entity(param);

    self.id = Math.random();
    //console.log(param.nome, param.map);

    //self.x = param.x
    //self.y = param.y;
    //self.map = param.map;

    self.nome = param.nome;
    self.img = param.img;
    self.maxPlayer = param.maxPlayer;
    self.livelloMin = param.livelloMin;
    self.livelloMax = param.livelloMax;

    self.dungeon_options = param;
    self.numberPlayerIn = 0;

    self.timer = 0;
    self.timeToRemove = 1400; // 1 minuto e rimuovi la porta per entrare
    self.toRemove = false;

    var super_update = self.update;
    self.update = function(){
        //console.log(self.timer);
        if(self.timer++ > self.timeToRemove)
            self.toRemove = true;
        super_update();

        if(self.numberPlayerIn >= self.maxPlayer) self.toRemove = true;

        for(var i in Player.list){
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 64 && p.collectItem){
                //entra nel dungeon se preme R

                let data = {dungeon: self.id, player: p.id}

                p.socket.emit("confirm", 
                    {
                        msg:"Sei sicuro di voler nel dungeon?", 
                        emit:{
                            nome:"verificaEnterDungeon",
                            bool:true
                        },
                        data: data
                    }
                );
            }
        }
        
    }
    self.createDungeon = function(){
        let enemy_spawn = [], npc_ = [];
        for(var j in self.dungeon_options.Object){
            if(self.dungeon_options.Object[j].name == "Spawn" && self.dungeon_options.Object[j].type == "Enemy"){
                enemy_spawn.push(self.dungeon_options.Object[j]);
            }
            if(self.dungeon_options.Object[j].type == "NPC"){
                npc_.push(self.dungeon_options.Object[j]);
            }
        }
    
        createWorld(
            enemy_spawn,
            self.nome,
            npc_
        );
    }

    self.createDungeon();

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            img:self.img,
        };
    }

    self.getUpdatePack = function(){
        return {};
    }
    Dungeon.list[self.id] = self;
    initPack.dungeon.push(self.getInitPack());
    return self;
}
Dungeon.list = {};
Dungeon.update = function(){

    var pack = [];
    for(var i in Dungeon.list){
        var dungeon = Dungeon.list[i];
        dungeon.update();
        if(dungeon.toRemove){
            delete Dungeon.list[i];
            removePack.dungeon.push(dungeon.id);
        }else{
            pack.push(dungeon.getUpdatePack());
        }
    }
    return pack;
}
Dungeon.getAllInitPack = function(){
    var dungeons_ = [];
    for(var i in Dungeon.list){
        dungeons_.push(Dungeon.list[i].getInitPack());
    }
    return dungeons_;
}



CanvasText = function(param){
    var self = Entity(param);

    self.id = Math.random();
    self.timeToRemove = 50; // 1 minuto = 1400

    self.entity = param.entity;

    self.x = param.x;
    self.y = param.y;
    self.yUp = 0;
    self.map = param.map;
    self.msg = param.msg;
    self.color = param.color;

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        //console.log(self.timer);
        if(self.timer++ > self.timeToRemove)
            self.toRemove = true;
        super_update();

        for(var i in Player.list){
            var p = Player.list[i];
            if(p.id == self.entity.id){
                self.x = p.x;
                self.y = p.y + self.yUp;
            }
        }

        for(var i in Enemy.list){
            var e = Enemy.list[i];
            if(e.id == self.entity.id){
                self.x = e.x;
                self.y = e.y + self.yUp;
            }
        }
        
        self.yUp-=2;
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            msg:self.msg,
            color:self.color,
        };
    }

    self.getUpdatePack = function(){
        let obj = {};
        if(self.x !=  self.LASTX){obj.x = self.x;self.LASTX = self.x;}
        if(self.y !=  self.LASTY){obj.y = self.y;self.LASTY = self.y;}

        if(!isEmpty(obj)) obj.id = self.id;
        else return {};

        return obj;
        /*
        return {
            id:self.id,
            x: self.x,
            y: self.y,
        }
        */
    }
    CanvasText.list[self.id] = self;
    initPack.canvasText.push(self.getInitPack());
    return self;
}
CanvasText.list = {};
CanvasText.update = function(){

    var pack = [];
    for(var i in CanvasText.list){
        var canvasText = CanvasText.list[i];
        canvasText.update();
        if(canvasText.toRemove){
            delete CanvasText.list[i];
            removePack.canvasText.push(canvasText.id);
        }else{
            pack.push(canvasText.getUpdatePack());
        }
    }
    return pack;
}
CanvasText.getAllInitPack = function(){
    var canvasTexts = [];
    for(var i in CanvasText.list){
        canvasTexts.push(CanvasText.list[i].getInitPack());
    }
    return canvasTexts;
}

createWorld = function(enemy_spawn, map, npc_){

    for(var i in npc_){
        var x = npc_[i].x,
            y = npc_[i].y;
        
        if(npc_[i].type=="NPC"){
            let noplayer = search_name(npc_[i].name, npcs);    
            //console.log(noplayer);
            if(noplayer){
                noplayer.x = x;
                noplayer.y = y;
                noplayer.map = map;
                NPC(noplayer);
            }
        }
    }

    for(var i in enemy_spawn){
        //console.log("nemico")
        var nemici = JSON.parse(enemy_spawn[i].properties.nemici);
        var quantita = enemy_spawn[i].properties.quantita;
        
        for(var f in nemici){

            let enemy = search_name(nemici[f], enemys);            

            if(enemy){

                let spawn_options = {
                    x: enemy_spawn[i].x,
                    xMax: enemy_spawn[i].x + enemy_spawn[i].width,
                    y: enemy_spawn[i].y,
                    yMax: enemy_spawn[i].y + enemy_spawn[i].height,
                };

                

                for(var o=0;o<quantita;o++){

                    Enemy({
                        nome: enemy.nome, 
                        nomeI: nemici[f],
                        map: map,
                        spawn_options: spawn_options,
                        bulletImgSrc: enemy.img_bullet,
                        drops: enemy.drops,
                        exp: enemy.esperienza,
                        dungeon: enemy.dungeon,
                        dungeonBoss: enemy.dungeonBoss,

                        hp:enemy.hp,
                        hpMax:enemy.hp,
                        defence:enemy.defence,
                        damage:enemy.damage,
                        speed:enemy.speed,
                        atkSpd:enemy.speed_attacco,
                        timeToAttack:enemy.time_to_attack,
                        timeToSuperAttack:enemy.time_to_super_attack,
                        numShotSuperAttack:enemy.num_shot_super_attack,
                        timeToRespawn:enemy.timeToRespawn,
                        
                        animation:enemy.animation,


                        bulletSpeed:enemy.speed_bullet,
                        bulletTimeToRemove:enemy.bullet_time_to_remove,
                        bulletFrWidth:enemy.bulletFrWidth,
                        bulletFrHeight:enemy.bulletFrHeight,
                        bulletRatio:enemy.bulletRatio,
                        bulletAnimationSpeed:enemy.bulletAnimationSpeed,
                    
                        range:enemy.range_attacco,   

                    });
                }
            }
        }
    }
}