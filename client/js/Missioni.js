Missioni = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        missioni: param.missioni,
        missioniCompletate: param.missioniCompletate,
        mostri: param.mostri
    }

    self.addCommento = function(itm){
        let str = "";
        for(var i in itm){
            let this_item = search_name(itm[i].nome, items);
            str = str+this_item.nome+" x"+itm[i].quantita+", ";
        }
        var res = str.lastIndexOf(",");
        return str.substring(0,res);
    }

    for(let i in self.missioni)
        self.missioni[i].ricompensa.commento = self.addCommento(self.missioni[i].items);
    

    self.add = function(param){
        if(!self.has(param.nome)){
            param.ricompensa.commento = self.addCommento(param.ricompensa.items);
            self.missioni.push(param);

            self.refreshRender();
        }
    }

    self.addMostro = function(nome){

        for(var i in self.missioni){
            let questCompleted = false;
            
            for(var j in self.missioniCompletate){
                if(self.missioniCompletate[j] == self.missioni[i].nome){
                    questCompleted = true;
                }
            }

            console.log(self.missioni[i].nome, questCompleted);
            
            if(!questCompleted){
                for(var l in self.missioni[i].obbiettivo.enemys){
                    if(self.missioni[i].obbiettivo.enemys[l].nome == nome){
                        let existMostro = false;
                        for(var i in self.mostri){
                            if(self.mostri[i].nome == nome){
                                self.mostri[i].quantita++;
            
                                existMostro = true;
                            }
                        }
                        if(!existMostro) self.mostri.push({nome:nome, quantita:1});
            
                        self.socket.emit('updateMostriMissioni', self.mostri);
                    }
                }
            }

        }


        //console.log(self.mostri);
        /*
        let add = false, questCompleted = false;
        for(var i in self.missioni)
            for(var j in self.missioniCompletate)
                if(self.missioniCompletate[j] == self.missioni[i].nome)
                    questCompleted = true;

        if(!questCompleted)
            for(var i in self.missioni)
                for(var l in self.missioni[i].obbiettivo.enemys)
                    if(self.missioni[i].obbiettivo.enemys[l].nome == nome) 
                        add = true;
        
        console.log(nome, questCompleted, add);
        if(add){
            let existMostro = false;
            for(var i in self.mostri){
                if(self.mostri[i].nome == nome){
                    self.mostri[i].quantita++;

                    existMostro = true;
                }
            }
            if(!existMostro) self.mostri.push({nome:nome, quantita:1});

            self.socket.emit('updateMostriMissioni', self.mostri);
        }

        //console.log(self.mostri);
        */
    }

    self.has = function(nome){
        //id = 1,2,3,4,...(livello)

        for(var i in self.missioni){
            if(self.missioni[i].nome == nome){
                return true;
            }
        }

        return false;
    }

    self.remove = function(nome){
        for(var i in self.missioni){
            if(self.missioni[i].nome == nome){
                self.missioni.splice(i,1);
                //delete self.missioni[i];
                break;
            }
        }

        self.refreshRender();
    }

    self.update = function(){
    
        let p = Player.list[self.socket.id];
        let ObbiettivoItem = false, ObbiettivoMostri = false, nomeQuest = "";

        for(var k in self.missioni){

            let miss = self.missioni[k];
            let obbiettivo, next = false;
            nomeQuest = miss.nome;

            for(var r in self.missioniCompletate)
                if(self.missioniCompletate[r] == nomeQuest)
                    next = true;
        
            if(!next){

                miss.obbiettivo.items.length == 0 ? ObbiettivoItem = true : null;
                miss.obbiettivo.enemys.length == 0 ? ObbiettivoMostri = true : null;

                for(var l in miss.obbiettivo.items){
                    obbiettivo = miss.obbiettivo.items[l];
                    ObbiettivoItem = p.inventory.hasItem(obbiettivo.nome, obbiettivo.quantita);
                }

                for(var l in miss.obbiettivo.enemys){
                    obbiettivo = miss.obbiettivo.enemys[l];

                    for(var j in self.mostri){
                        let mostro = self.mostri[j];
                        if(mostro.nome == obbiettivo.nome && mostro.quantita >= obbiettivo.quantita) ObbiettivoMostri = true;
                    }
                }

                if(ObbiettivoItem && ObbiettivoMostri){
                    //quest completata
                    //console.log("quest completa");
        
                    self.missioniCompletate.push(nomeQuest);

                    for(var j in self.mostri)
                        if(self.mostri[j].nome == obbiettivo.nome)
                            self.mostri.splice(j,1);
                            //delete self.mostri[j];

                    for(var l in miss.obbiettivo.items){
                        obbiettivo = miss.obbiettivo.items[l];
                        p.inventory.removeItem(obbiettivo.nome, obbiettivo.quantita);
                    }

                    CanvasText({msg:"Quest completata!", map:p.map, color:"#FF00FF", x:p.x, y:p.y, entity:p});
                    self.refreshRender();
                }
            }
        }
        
    }
    
    self.refreshRender = function(closeSpiegazione){
		//server
		if(self.server){
			self.socket.emit('updateMissioni', {missioni:self.missioni, missioniCompletate:self.missioniCompletate});
			return;
		}

        //client only
        if(closeSpiegazione){
            document.getElementById("titoloMissione").innerHTML = "";
            document.getElementById("spiegazioneMissione").innerHTML = "";
            document.getElementById("obbiettivoMissione").innerHTML = "";
            document.getElementById("ricompensaMissione").innerHTML = ""; 
        }
        self.drawMissioni();
    }

    self.drawMissioni = function(){
		var elements = document.getElementsByClassName("miss-refresh-delete");
        while (elements.length > 0) elements[0].remove();

        if(self.missioni.length >= 1) document.getElementById("quest_img").src = "client/img/gui/Quest_Active.gif";
        else document.getElementById("quest_img").src = "client/img/gui/Quest.png";
        
        for(var i in self.missioni){

            let miss = self.missioni[i], allmiss = document.getElementById("allmiss"), completa = false;

            if(miss != null){
                for(var j in self.missioniCompletate)
                    if(self.missioniCompletate[j] == miss.nome)
                        completa = true;
                
                
                let str = "";
                for(var j in self.mostri)
                    for(var l in miss.obbiettivo.enemys)
                        if(miss.obbiettivo.enemys[l].nome == self.mostri[j].nome)
                            str+=self.mostri[j].nome+" x"+self.mostri[j].quantita+", ";
                        
                var res = str.lastIndexOf(",");
                str = str.substring(0,res);

                console.log(str);
                
                let div = document.createElement("DIV");
                    div.classList.add("miss-refresh-delete");
                    if(completa) div.classList.add("missioneCompletata")
                    allmiss.appendChild(div);
                let img = document.createElement("IMG");
                    img.classList.add("img-blocks");
                    img.classList.add("miss-refresh-delete");
                    img.classList.add("x64");
                    img.id = miss.nome;
                    img.src = "client/img/gui/Missioni.png";
                    img.addEventListener('click', function(e){self.socket.emit("verificaMissione", miss.nome);});
                    img.addEventListener('mouseover', function(e){
                        document.getElementById("titoloMissione").innerHTML = miss.nome;
                        document.getElementById("spiegazioneMissione").innerHTML = miss.spiegazione;
                        document.getElementById("obbiettivoMissione").innerHTML = str;                       
                        document.getElementById("ricompensaMissione").innerHTML = "monete: "+miss.ricompensa.monete+"<br>gemme: "+miss.ricompensa.gemme+"<br>esperienza: "+miss.ricompensa.esperienza+"<br>"+miss.ricompensa.commento;

                        this.style.opacity = 0.5;});
                    img.addEventListener('mouseout', function(e){
                        document.getElementById("titoloMissione").innerHTML = "";
                        document.getElementById("spiegazioneMissione").innerHTML = "";
                        document.getElementById("obbiettivoMissione").innerHTML = "";
                        document.getElementById("ricompensaMissione").innerHTML = "";
                        this.style.opacity = 1;});
                    img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                    img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                    div.appendChild(img);
            }
        }
    }

    self.open = function(){
        if(!trade.isOpen){
            let m = document.getElementById("missioni");
            if(m.style.display == "block") m.style.display = "none";
            else{
                m.style.display = "block";
                document.getElementById("inventario").style.display = "none";
                document.getElementById("group").style.display = "none";
                document.getElementById("migliora").style.display = "none";
            }
        }
    }
    
    if(self.server){

        self.socket.on("verificaMissione", function(nome){
            for(var j in self.missioniCompletate){
                if(self.missioniCompletate[j] == nome){
                    // quest completa

                    for(var i in self.missioni){
                        let miss = self.missioni[i];
                        if(miss.nome == nome){
                            let p = Player.list[self.socket.id];

                            p.gold += miss.ricompensa.monete;
                            p.gemme += miss.ricompensa.gemme;
                            p.addExp(miss.ricompensa.esperienza);

                            for(var k in miss.ricompensa.items){
                                let itm = search_name(miss.ricompensa.items[k].nome, items);
                                p.inventory.addItem(miss.ricompensa.items[k].nome, itm, miss.ricompensa.items[k].quantita);
                            }

                            self.missioni.splice(i,1);
                            //delete self.missioni[i];
                            self.refreshRender();       

                            break;
                        }
                    }
                }
            }
        });

    }

    self.refreshRender();
    if(self.server) self.socket.emit('updateMostriMissioni', self.mostri);
    
    return self;
}