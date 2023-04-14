search_player = function(player){
    for(var i in Player.list){
        let p = Player.list[i]; 
        if(p.username === player){
            return p;
        }
    }
}

give = function(player, id_item, quantita){
    let p = search_player(player);
    if(p){
        let item = search_name(id_item, items);
        if(item){
            p.inventory.addItem(id_item, item, quantita);

            p.socket.emit("alert", "Player "+player+" aggiunto/a "+id_item+" x"+quantita);
        }
    }
}

heal = function(player){
    let p = search_player(player);
    if(!p) return;

    p.hp = p.hpMax;
    p.mp = p.mpMax;

    p.socket.emit("alert", "Player "+player+" curato!");
}

gold = function(player,quantita){
    let p = search_player(player);
    if(!p) return;

    p.gold+=quantita;

    p.socket.emit("alert", "Player "+player+" ha "+p.gold+" gold");
}

gemme = function(player,quantita){
    let p = search_player(player);
    if(!p) return;

    p.gemme+=quantita;

    p.socket.emit("alert", "Player "+player+" ha "+p.gemme+" gemme");
}

god = function(player){
    let p = search_player(player);
    if(!p) return;

    p.regHp += 99999; 
    p.regMp += 99999; 

    p.socket.emit("alert", "Player "+player+" inserita god");
}

ungod = function(player){
    let p = search_player(player);
    if(!p) return;

    p.regHp -= 99999; 
    p.regMp += 99999; 

    p.socket.emit("alert", "Player "+player+" tolta god");
}

tp = function(player, mappa){
    let p = search_player(player);
    if(p){
        let data = search_name(mappa,maps);
        if(data){
            p.map = data.nome;
            p.map_options = data;
        
            for(var i in Pet.list) if(Pet.list[i].parent == p.id) Pet.list[i].map = data.nome;
        
            p.mondo.changeMap(p.map_options);
            p.spawn();
        
            p.socket.emit("alert", "Player "+player+" teletrasportato in "+mappa);
        }
    }
}

doSkill = function(player, nome){
    let p = search_player(player);
    if(!p) return;

    p.doSkill(nome);

    //p.socket.emit("alert", "Player "+player+" aggiunto/a "+id_item+" x"+quantita);
}

addSkill = function(player, nome){
    let p = search_player(player);
    if(!p) return;

    p.addSkill(nome);

    //p.socket.emit("alert", "Player "+player+" aggiunto/a "+id_item+" x"+quantita);
}

emptyInv = function(player){
    let p = search_player(player);
    if(!p) return;

    p.inventory.items = [];
}

speed = function(player, speed){
    let p = search_player(player);
    if(!p) return;

    p.maxSpd+=speed;
}

exp = function(player, exp){
    let p = search_player(player);
    if(!p) return;

    p.addExp(exp);  
}

setExp = function(player, exp){
    let p = search_player(player);
    if(!p) return;
    
    p.esperienza = exp;  
}