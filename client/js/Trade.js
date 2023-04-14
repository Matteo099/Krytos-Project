Trade = function(param){

    var self = {
		socket: param.socket,
        server: param.server,
        name: param.name,

        items: [],
        player: undefined,
        state: {
            dot:{
                mio:false,
                suo: false
            },
            monete:{
                mio:0,
                suo:0
            }
        },
        buttons: {},
        isOpen: false
    }

    self.isTrading = function(){
        if(self.player) return true;

        return false;
    }
    self.existUser = function(name){
        for(var i in Player.list){
            if(Player.list[i].username == name) return i;
        }

        return false;
    }
    self.doTrade = function(name){
        if(self.existUser(name) != false){
            let p = self.getPlayer(name);
            if(p){
                p.socket.emit("confirm", 
                    {
                        msg:"Il player "+self.name+" vorrebbe fare uno scambio.", 
                        emit:{
                            nome:"verificaPartecipaTrade",
                            bool:true
                        },
                        data: self.socket.id
                    }
                );
            }else self.socket.emit("alert","Player non online o username sbagliato!");
        }else self.socket.emit("alert","Player non online o username sbagliato!");
    }

    self.addItemTrade = function(opt){
        for(var i in self.items){
            if(self.items[i].id == opt.id){
                self.removeItemTrade(opt.id);
                return;
            }
        }

        self.socket.emit('prompt', {
            titolo:"Attenzione!", 
            msg:"Inserire quantita dell'item", 
            emit:{bool:true, nome:"verificaIQI"},
            data:opt.id
        });
    }    
    self.removeItemTrade = function(id){
        for(var i in self.items){
            if(self.items[i].id == id){
                self.items.splice(i, 1);
                self.refreshTrade2();
                break;
            }
        }
    }

    self.changeStateTrade = function(){
        self.state.dot.mio ^= true;

        self.refreshTrade2();
    }

    self.getPlayer = function(name){
        if(self.existUser(name)) return Player.list[self.existUser(name)];

        return false;
    }
    
    self.closeTrade = function(){

        let p = Player.list[self.player];

        if(p){
            p.trade.isOpen = false;

            p.trade.player = undefined;
            p.trade.items = [];
            p.trade.state = {
                dot:{
                    mio:false,
                    suo: false
                },
                monete:{
                    mio:0,
                    suo:0
                }
            };
            p.trade.buttons = {};

            p.trade.refreshRender();
        }

        self.isOpen = false;

        self.player = undefined;
        self.items = [];
        self.state = {
            dot:{
                mio:false,
                suo: false
            },
            monete:{
                mio:0,
                suo:0
            }
        };
        self.buttons = {};

        self.refreshRender();
    }


    self.emit = function(opt, opt2){
        //client only
        self.socket.emit(opt, opt2);
    }
   

    self.refreshTrade2 = function(){
        self.refreshTrade();
        Player.list[self.player].trade.refreshTrade();

        if(self.state.dot.mio && self.state.dot.suo){
            
            let p = Player.list[self.player],
                self_p = Player.list[self.socket.id];

            let spazio = true;
            for(var i in self.items){
                if(!p.inventory.simulateAddItem(self.items[i].id)){
                    //non c'è abbastanza spazio
                    self.socket.emit("alert", p.username+" non ha abbastanza spazio nell'inventario!");
                    p.socket.emit("alert", "Non hai abbastanza spazio nell'inventario!");
                    spazio = false;
                    break;
                }
            }
            for(var i in p.trade.items){
                if(!self_p.inventory.simulateAddItem(p.trade.items[i].id)){
                    //non c'è abbastanza spazio
                    p.socket.emit("alert", self_p.username+" non ha abbastanza spazio nell'inventario!");
                    self.socket.emit("alert", "Non hai abbastanza spazio nell'inventario!");
                    spazio = false;
                    break;
                }
            }

            if(spazio){
                for(var i in self.items){
                    let itm = search_name(self.items[i].id, items);
                    p.inventory.addItem(self.items[i].id, itm, self.items[i].amount);
                    self_p.inventory.removeItem(self.items[i].id, self.items[i].amount);
                }

                for(var i in p.trade.items){
                    let itm = search_name(p.trade.items[i].id, items);
                    self_p.inventory.addItem(p.trade.items[i].id, itm, p.trade.items[i].amount);
                    p.inventory.removeItem(p.trade.items[i].id, p.trade.items[i].amount);
                }

                p.gold += self.state.monete.mio;
                p.gold -= self.state.monete.suo;
                self_p.gold += self.state.monete.suo;
                self_p.gold -= self.state.monete.mio;
            }

            self.closeTrade();
        }
    }
    self.refreshTrade = function(){

        let mio_inv = Player.list[self.socket.id];
        if(mio_inv){
            mio_inv = mio_inv.inventory.items;
            for(var j in mio_inv){
                let b = false, amm = mio_inv[j].amount;
                for(var i in self.items){
                    if(mio_inv[j].id == self.items[i].id){
                        b = true;
                        amm = self.items[i].amount;
                        break;
                    }
                }
                    
                self.buttons[j+"im"] = {
                    amount:amm, 
                    id:mio_inv[j].id,
                    item:mio_inv[j].item,
                    b:b
                }
            }
        }

        let p = Player.list[self.player];
        if(p){
            let suo_inv = p.inventory.items;
            p = p.trade;

            self.state.dot.suo = p.state.dot.mio;
            self.state.monete.suo = p.state.monete.mio;

            for(var j in suo_inv){
                let b=false, amm = suo_inv[j].amount;
                for(var i in p.items){
                    if(suo_inv[j].id == p.items[i].id){
                        b = true;
                        amm = p.items[i].amount;
                        break;
                    }
                }

                self.buttons[j+"is"] = {
                    amount:amm, 
                    id:suo_inv[j].id,
                    item:suo_inv[j].item,
                    b:b
                }
            }
        }

        self.refreshRender();
    }

    
    self.refreshRender = function(){
		//server
		if(self.server){
            //console.log(self.host, self.users);
			self.socket.emit('updateTrade', {name:self.name, player:self.player, items:self.items, buttons:self.buttons, state:self.state, isOpen:self.isOpen});
            return;
		}

        //client only
        if(self.player) self.drawTrade();
        else document.getElementById("trade").style.display = "none";
    }

    self.drawTrade = function(){

        var elements = document.getElementsByClassName("trade-refresh-delete");
        while (elements.length > 0) elements[0].remove();

        var addButton = function(data, i){
            let td = document.getElementById(i);

            let it_is = false;
            if(i.indexOf("im") != -1) it_is = true;

            if(data.b) td.classList.add("red");
            else td.classList.remove("red");

            let text = document.createElement("SPAN");
                text.innerText = "x"+data.amount;
                text.style.position="absolute";
                text.classList.add("inv-span");
                text.classList.add("trade-refresh-delete");
                text.classList.add("priorita10");

                if(data.b) text.style.color = "yellow";
                else text.style.color = "white";

                td.appendChild(text);
            let img = document.createElement("IMG");
                img.classList.add("img-blocks");
                img.classList.add("trade-refresh-delete");
                img.classList.add("x64");
                img.src = data.item.imgInv;
                img.addEventListener('click', function(e){
                    if(it_is){
                        //se l'oggetto è suo puoi clickare
                        socket.emit("addItemTrade", {
                            amount: data.amount, 
                            id: data.id
                        });
                    }
                });
                img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
                img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
                img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                atrTooltip(img, data.item.commento);
                td.appendChild(img);
        }

        for(var i in self.buttons){
            addButton({
                amount:self.buttons[i].amount, 
                id:self.buttons[i].id,
                item:self.buttons[i].item,
                b:self.buttons[i].b
            }, i);
        }

        if(self.state.dot.mio) document.getElementById("stato_mio").style.backgroundColor = "green";
        else document.getElementById("stato_mio").style.backgroundColor = "red";

        if(self.state.dot.suo) document.getElementById("stato_suo").style.backgroundColor = "green";
        else document.getElementById("stato_suo").style.backgroundColor = "red";

        document.getElementById("gold_mio").innerText = "Monete: "+self.state.monete.mio;
        document.getElementById("gold_suo").innerText = "Monete: "+self.state.monete.suo;
    }

    if(self.server){

        self.socket.on("doTrade", function(){ 
            self.socket.emit('prompt', {
                titolo:"Attenzione!", 
                msg:"Inserire nome del player", 
                emit:{bool:true, nome:"faiTrade"}
            });
        });
        self.socket.on("faiTrade", function(name){
            //console.log(name);
            self.doTrade(name);
        });
        self.socket.on("verificaPartecipaTrade", function(id){

            self.player = id;
            Player.list[id].trade.player = self.socket.id;
            
            self.isOpen = true;
            Player.list[id].trade.isOpen = true;

            self.refreshTrade2();
            
            self.socket.emit("openTrade");
            Player.list[id].trade.socket.emit("openTrade");

        });

        self.socket.on("addItemTrade", function(opt){
            self.addItemTrade(opt);
        });
        self.socket.on("verificaIQI", function(data){
            let p = Player.list[self.socket.id];

            let r = parseInt(data.text);

            if(!isNaN(r)){ 

                if(p.inventory.hasItem(data.data, r)) self.items.push({id:data.data, amount:r});
                else self.items.push({id:data.data, amount:p.inventory.howItem(data.data)});
                
                self.refreshTrade2();
            }
        });

        self.socket.on("changeGold", function(gold){

            if(Player.list[self.socket.id].gold >= gold){

                if(gold <= 0) self.state.monete.mio = 0;
                else if(gold >= 9999999) self.state.monete.mio = 9999999;
                else self.state.monete.mio = gold;

            }else self.state.monete.mio = Player.list[self.socket.id].gold;

            self.refreshTrade2();
        });

        self.socket.on("confermaScambio", function(){
            self.changeStateTrade();
        });
        self.socket.on("annullaScambio", function(){
            self.closeTrade();
        });
    }

    self.openTrade = function(){
        let m = document.getElementById("trade");
        m.style.display = "block";
    }

    self.refreshRender();

    
    return self;
}