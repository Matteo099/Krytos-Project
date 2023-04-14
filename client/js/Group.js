Group = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        host: {name:"", id:undefined},//{name:"", id:socket.id}
        users: [],//[{name:"", id:socket.id},{name:"", id:socket.id}...]
        clicked: undefined,
        name: param.name,
        groupName: undefined
    }

    self.hasGroup = function(){
        if(self.host.name == "") return false;

        return true;
    }
    self.newGroup = function(name){
        if(!self.hasGroup()){
            self.host = {
                name: Player.list[self.socket.id].username, 
                id: self.socket.id
            };
            self.groupName = name;
            Group.list[self.groupName] = self;

            self.refreshRender();
        }else self.socket.emit("alert", "Sei già in un gruppo!");
    }
    self.isHost = function(){
        if(self.host.name == Player.list[self.socket.id].username) return true;
        
        return false;
    }
    self.getHost = function(){
        if(Player.list[self.host.id]) return Player.list[self.host.id].group;
    }
    self.checkUser = function(name){
        for(var i in self.users)
            if(self.users[i].name == name)
                return true;

        return false;
    }
    self.existUser = function(name){
        for(var i in Player.list){
            if(Player.list[i].username == name) return i;
        }

        return false;
    }
    self.removeUser = function(name){
        let h = self.getHost();
        if(h){
            for(var i in h.users){
                if(h.users[i].name == name){

                    let p = Player.list[h.users[i].id].group;
                    if(p.isHost()) delete Group.list[p.groupName];

                    p.host = {name:"", id:undefined};
                    p.users = [];
                    p.refreshRender();

                    h.users.splice(i,1);
                    h.refreshGroup();
                    return ;
                }
            }

            self.socket.emit("alert","Player non presente nel gruppo!");
        }
    }
    self.insertUser = function(name){
        let h = self.getHost();

        if(h){
            if(!h.checkUser(name)){
                let id = h.existUser(name); 
                if(id){
                    if(!Player.list[id].group.hasGroup()){
                        h.users.push({name:name, id:id});
                        h.refreshGroup();
                    }else h.socket.emit("alert", "Player già presente in un gruppo");
                }else h.socket.emit("alert", "Player non online o username sbagliato");
            }else h.socket.emit("alert", "Player già presente nel gruppo");
        }
    }
    self.emit = function(opt){
        //client only
        self.socket.emit(opt);
    }
    self.removeFromGroup = function(name){
        if(self.hasGroup()){
            if(self.host.name == name){

                delete Group.list[self.groupName];
                
                for(var i in self.users){
                    let p = Player.list[self.users[i].id];
                    if(p){
                        p.group.users = [];
                        p.group.host = {name:"", id:undefined};
        
                        p.group.refreshRender();
                    }
                }

                self.host = {name:"", id:undefined};
                self.users = [];
                self.refreshRender();
                //console.log("remove host");
            }else{
                self.removeUser(name);
                //console.log("remove user");
            }
        }
    }
    self.getGroup = function(name){
        for(var i in Group.list)
            if(i == name) 
                return Group.list[i];
        
        return false;
    }


    self.addExpGroup = function(mob_exp){

        let exp = (mob_exp * global_config.EXP/100);

        if(self.hasGroup()){
            if(self.users.length != 0) exp = mob_exp - (mob_exp/(self.users.length+1));

            for(var i in self.users){
                let user = Player.list[self.users[i].id];
                let p = Player.list[self.socket.id];
                if(user.map == p.map && p.getDistance(user) <= 500){
                    user.addExp(exp/user.livello);
                }
            }

            let host = Player.list[self.host.id];
            let p = Player.list[self.socket.id];
            if(host.map == p.map && p.getDistance(host) <= 500){
                host.addExp(exp/host.livello);
            }
        }else{
            Player.list[self.socket.id].addExp(exp/Player.list[self.socket.id].livello);
        }
    }

    self.refreshGroup = function(){
        let h = self.getHost();
        if(h){
            h.users = self.users;
            h.host = self.host;
            h.refreshRender();
        }

        for(var i in self.users){
            let p = Player.list[self.users[i].id];

            if(p){
                p.group.users = self.users;
                p.group.host = self.host;

                p.group.refreshRender();
            }
        }
    }

    self.refreshRender = function(){
		//server
		if(self.server){
            //console.log(self.host, self.users);
			self.socket.emit('updateGroup', {host: self.host, users:self.users, name:self.name, clicked:self.clicked, groupName:self.groupName});
            return;
		}

        //client only
        self.drawGroup();
    }

    if(self.server){

        self.socket.on("gruppo", function(){
            self.socket.emit('prompt', {
                titolo:"Attenzione!", 
                msg:"Inserire nome del gruppo", 
                emit:{bool:true, nome:"createGroup"}
            });
        });
        self.socket.on("createGroup", function(name){
            let create = true;
            for(var i in Group.list)
                if(i == name) create = false;

            if(create) self.newGroup(name);
            else self.socket.emit("alert","Nome gruppo già utilizzato!");
        });
        self.socket.on("inserisci", function(){ 
            self.socket.emit('prompt', {
                titolo:"Attenzione!", 
                msg:"Inserire nome Player da aggiungere al gruppo", 
                emit:{bool:true, nome:"insertUser"}
            });
        });
        self.socket.on("insertUser", function(t){
            //console.log(t);
            self.insertUser(t);
        });
        self.socket.on("rimuovi", function(){
            let h = self.getHost();

            if(h.clicked){
                let n = h.clicked;
                h.clicked = undefined;
                self.removeUser(n);
            }
        });
        self.socket.on("abbandona", function(){
            self.removeFromGroup(self.name);
        });
        self.socket.on("partecipa", function(){ 
            self.socket.emit('prompt', {
                titolo:"Attenzione!", 
                msg:"Inserire nome del gruppo cui vuoi partecipare", 
                emit:{bool:true, nome:"partecipaGroup"}
            });
        });
        self.socket.on("partecipaGroup", function(t){
            //console.log(t);
            let g = self.getGroup(t);

            if(g){
                g.socket.emit("confirm", 
                    {
                        msg:"Il player "+self.name+" vorrebbe partecipare al tuo gruppo.", 
                        emit:{
                            nome:"verificaPartecipaGroup",
                            bool:true
                        },
                        data: self.socket.id
                    }
                );
            }else self.socket.emit("alert", "Gruppo inesistente!");
        });
        self.socket.on("verificaPartecipaGroup", function(id){
            self.insertUser(Player.list[id].username);
        });

        self.socket.on("clickUser", function(user){
            let h = self.getHost();
            if(user != self.host.name){
                h.clicked = user;
                self.refreshRender();
            }
        });
    }

    
    self.drawGroup = function(){

        var elements = document.getElementsByClassName("group-refresh-delete");
        while (elements.length > 0) elements[0].remove();


        var draw = function(users, p){
            let allusers = document.getElementById("allusers");

            document.getElementById("nuovo").style.display = "none";
            document.getElementById("partecipa").style.display = "none";

            document.getElementById("abbandona").style.display = "inline";

            let div = document.createElement("DIV");
                div.classList.add("group-refresh-delete");
                if(self.clicked && users.name == self.clicked) div.classList.add("userClicked");
                allusers.appendChild(div);
            let img = document.createElement("IMG");
                img.classList.add("img-blocks");
                img.classList.add("group-refresh-delete");
                img.classList.add("x64");
                img.id = users.name;
                img.src = "client/img/pg/Singola/"+p.animation.img.replace("client/img/pg/","");
                img.addEventListener('click', function(e){self.socket.emit("clickUser", users.name);});
                img.addEventListener('mouseover', function(e){
                    document.getElementById("nomeUser").innerHTML = users.name;
                    document.getElementById("infoUser").innerHTML = "livello: "+p.livello+"<br>punti: "+p.score;
                    this.style.opacity = 0.5;});
                img.addEventListener('mouseout', function(e){
                    document.getElementById("nomeUser").innerHTML = "";
                    document.getElementById("infoUser").innerHTML = "";
                    this.style.opacity = 1;});
                img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                div.appendChild(img);

        }
        
        if(self.host.id != undefined && Player.list[self.host.id]){
            
            if(self.name == self.host.name){
                document.getElementById("inserisciG").style.display = "inline";
                
                //console.log("host");
                
                if(!self.clicked) document.getElementById("rimuovi").style.display = "none";
                else document.getElementById("rimuovi").style.display = "inline";
            }
                
            draw(self.host, Player.list[self.host.id]);
        }
        else if(!self.host.id){
            document.getElementById("nuovo").style.display = "inline";
            document.getElementById("partecipa").style.display = "inline";
            document.getElementById("abbandona").style.display = "none";
            document.getElementById("inserisciG").style.display = "none";
        }
        for(var i in self.users) draw(self.users[i], Player.list[self.users[i].id]);
    }
    self.open = function(){

        if(self.host.name == self.name){
            self.clicked = undefined;
            self.refreshRender();
        }

        if(!trade.isOpen){
            let m = document.getElementById("group");
            if(m.style.display == "block") m.style.display = "none";
            else{
                m.style.display = "block";

                document.getElementById("inventario").style.display = "none";
                document.getElementById("missioni").style.display = "none";
                document.getElementById("migliora").style.display = "none";

            }
        }
    }

    self.refreshRender();

    
    return self;
}
Group.list = {};