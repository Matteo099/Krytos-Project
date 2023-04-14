Ability = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        skill: param.skill,
        ricarica: [],
    }
    
    self.refreshRender = function(){
		//server
		if(self.server){
			self.socket.emit('updateAbility', {skill: self.skill, ricarica:self.ricarica});
			return;
		}

        //client only
        self.drawAbi();
    }

    self.refreshAbility = function(data){
        self.skill = data;
        self.refreshRender();
    }

    if(self.server){

        self.socket.on("removeRicaricaSkill", function(nome){
            delete self.ricarica[nome];
        });

        self.socket.on("doSkill", function(nome){
            //let a = search_name(nome, skills);
            let player = Player.list[self.socket.id];
            let a = false;
            for(var i in player.skill){
                if(player.skill[i].nomeI == nome){
                    a = player.skill[i];
                    break;
                }
            }

            if(!a) return;

            let faiSkill = true;
            if(player.mp >= a.mpUsed){
                if(!player.usingSkill){
                    for(var i in Abilita.used){
                        let au = Abilita.used[i];
                        //console.log(au.parent.id, player.id, au.nome, nome, player.usingSkill);
                        if(au.nome == nome && au.parent.id == player.id){
                            self.socket.emit("addToChat", "Skill non ancora carica");
                            faiSkill = false;
                            break;
                        }
                    } 
                }else{
                    faiSkill = false;
                    self.socket.emit("addToChat", "Skill in uso");
                }
            }else{
                faiSkill = false;
                self.socket.emit("addToChat", "Non hai abbastanza mp");
            }

            if(faiSkill){
                player.mp-=a.mpUsed;
                a.x = player.x;
                a.y = player.y;
                a.map = player.map;
                a.target = player;
                a.parent = player;

                if(a.option.type == "self") Abilita(a);
                if(a.option.type == "enemy"){

                    var nC = a.numeroColpi;
                    for(var i in Enemy.list){
                        var e = Enemy.list[i];
                        if(player.map === e.map && player.getDistance(e) < a.range){
                            a.target = e;
                            Abilita(a);
                            nC--;
                        }
                        if(nC<=0) break;
                    }
    
                    for(var i=0;i<nC;i++){
                        var pos = { 
                            x:randomNumber(player.x-(a.range*a.ratio)/2, player.x+(a.range*a.ratio)/2),
                            y:randomNumber(player.y-(a.range*a.ratio)/2, player.y+(a.range*a.ratio)/2)
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
                        if(player.map === p.map && player.getDistance(p) < a.range){
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
                        if(player.map === p.map && player.getDistance(p) < a.range*a.ratio){
                            a.target = p;
                            Abilita(a);
                        }
                    }
                }
                if(a.option.type == "enemy_collision"){

                    for(var i=0;i<a.numeroColpi;i++){

                        var pos = { 
                            x:randomNumber(player.x-(a.range)/2, player.x+(a.range)/2),
                            y:randomNumber(player.y-(a.range)/2, player.y+(a.range)/2)
                        }

                        for(var i in Enemy.list){
                            var e = Enemy.list[i];
                            if(player.map === e.map && player.getDistance(e) < a.range){
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
                            if(player.map === e.map && e.getDistance(pos) < a.range){
                                //a.target = p;
                                a.targets.push(e);
                            }
                        }

                        Abilita(a);
                    }
                }
            }
        });

        self.socket.on("miglioraSkill", function(nome){

            let player = Player.list[self.socket.id];
            let a = false;
            for(var i in player.skill){
                if(player.skill[i].nomeI == nome){
                    a = player.skill[i];
                    break;
                }
            }

            if(!a) return;

            let nextLevel = a.livello+1;
            let miglioramento;

            for(var q in a.miglioramenti){
                if(q == nextLevel){
                    miglioramento = a.miglioramenti[q];
                }
            }

            if(miglioramento){

                let str = "";
                for(var j in miglioramento.items){
                    let itm = miglioramento.items[j];
                    let this_item = search_name(itm.nome, items);
                    str = str+this_item.nome+" x"+itm.quantita+", ";
                }

                var res = str.lastIndexOf(",");
                var res2 = str.substring(0,res);


                self.socket.emit("confirm", 
                    {
                        msg:"Sei sicuro di voler aumentare di un livello <span class='titoloSkill'>"+nome+"</span> (lv."+a.livello+" -> lv."+nextLevel+")?<br>Item necessari:<br>"+miglioramento.monete+" monete,<br>"+miglioramento.gemme+" gemme,<br>"+miglioramento.esperienza+" esperienza,<br>"+res2+".", 
                        emit:{
                            nome:"verificaMiglioraSkill",
                            bool:true
                        },
                        data: nome
                    }
                );
            }else{
                self.socket.emit("alert", "Abilita a livello massimo");
            }
        });

        self.socket.on("verificaMiglioraSkill", function(nome){

            let player = Player.list[self.socket.id];
            let a = false;
            for(var i in player.skill){
                if(player.skill[i].nomeI == nome){
                    a = player.skill[i];
                    break;
                }
            }

            if(!a) return;

            let nextLevel = a.livello+1;
            let miglioramento;
            let migliora = true;

            for(var q in a.miglioramenti){
                if(q == nextLevel){
                    miglioramento = a.miglioramenti[q];
                }
            }


            if(miglioramento){
                if(player.gold >= miglioramento.monete){
                    if(player.gemme >= miglioramento.gemme){
                        if(player.esperienza >= miglioramento.esperienza){
                            for(var j in miglioramento.items){
                                let itm = miglioramento.items[j];
                                if(!player.inventory.hasItem(itm.nome, itm.quantita)){
                                    migliora = false;
                                    self.socket.emit("alert", "L'oggetto "+itm.nome+" non è presente nell'INVENTARIO. Assicurati che sia nell'inventario!");
                                    break;
                                }
                            }
                        }else{
                            migliora = false;
                            self.socket.emit("alert", "Non hai abbastanza esperienza! (ne serve "+miglioramento.esperienza+")");
                        }
                    }else{
                        migliora = false;
                        self.socket.emit("alert", "Non hai abbastanza gemme! (ne servono "+miglioramento.gemme+")");
                    }
                }else{
                    migliora = false;
                    self.socket.emit("alert", "Non hai abbastanza monete! (ne servono "+miglioramento.monete+")");
                }
            }else{
                migliora = false;
                self.socket.emit("alert", "Abilita a livello massimo");
            }



            if(migliora){

                self.socket.emit("alert", "Abilita migliorata!");

                for(var j in miglioramento.items){
                    let itm = miglioramento.items[j];
                    player.inventory.removeItem(itm.nome, itm.quantita);
                }
                player.esperienza -= miglioramento.esperienza;
                player.monete -= miglioramento.monete;
                player.gemme -= miglioramento.gemme;
                

                player.skill[i].livello = nextLevel;
                player.skill[i].timeToReuse = miglioramento.timeToReuse;
                player.skill[i].timeEffect = miglioramento.timeEffect;
                player.skill[i].numeroColpi = miglioramento.numeroColpi;
                player.skill[i].range = miglioramento.range;
                player.skill[i].ratio = miglioramento.ratio;
                player.skill[i].bonus = miglioramento.bonus;

                a = player.skill[i];

                let comm = "<span class='titoloSkill'>"+a.commento+"</span><br><br>livello: "+a.livello+"<br>mp utilizzati: "+a.mpUsed+"<br>durata effetto: "+a.timeEffect/1000+" sec.<br>tempo ricarica: "+a.timeToReuse/1000+" sec.<br>range: "+a.range+"px <br>colpi: "+a.numeroColpi+"<br>bonus: +"+a.bonus.hp+" hp, +"+a.bonus.mp+" mp, +"+a.bonus.damage+" atk, +"+a.bonus.defence+" def, +"+a.bonus.regHp+" regHp, +"+a.bonus.regMp+" regMp <br><br><span class='spiegazioneSkill'>"+a.spiegazione+"</span>";
                

                for(var w in self.skill){
                    if(self.skill[w].nome == player.skill[i].nomeI){
                        self.skill[w].commento_dettagliato = comm;
                        self.skill[w].livello = nextLevel;
                    }
                }

                player.ability.refreshRender();
            }
        });
    }

    self.refreshShadow = function(data){

        let inserisci = true;

        if(self.ricarica.length == 0){self.ricarica.push(data);}
        
        for(var i in self.ricarica){
            if(self.ricarica[i].nome == data.nome){
                self.ricarica[i] = data;
                inserisci = false;
            }
        }
        if(inserisci) self.ricarica.push(data);

        //console.log(self.ricarica);
        self.refreshRender();
        //self.socket.emit("refreshShadow", data);
    }

    self.drawAbi = function(){

        for(var i in self.ricarica){
            let ab = self.ricarica[i];
            
            let d = document.getElementById("ricarica_"+ab.nome);
            let d2 = document.getElementById("ricarica_"+ab.nome+"_migliora");
            let alpha = 1 - (ab.timer2/ab.timeToReuse); 
            if(alpha <= 0){
                alpha = 0;
                self.socket.emit("removeRicaricaSkill", ab.nome);
            }
            if(alpha<=0.3 && alpha >0) alpha = 0.3;
            //console.log(alpha);
            d.style.backgroundColor = "rgba(255, 0, 0, "+alpha+")";
            d2.style.backgroundColor = "rgba(255, 0, 0, "+alpha+")";
        }

        for(var i in self.skill){

            let sk = self.skill[i];
            let td = document.getElementById("abi"+i);
            let n_td = document.getElementById("abilita"+i);

            if(document.getElementById(sk.nome) == null){

                let div = document.createElement("DIV");
                    div.id = "ricarica_"+sk.nome;
                    div.classList.add("abi-refresh-delete");
                    div.style.backgroundColor = "rgba(255, 0, 0, 0)";
                    td.appendChild(div);
                let img = document.createElement("IMG");
                    img.classList.add("img-blocks");
                    img.classList.add("abi-refresh-delete");
                    img.classList.add("x64");
                    img.id = sk.nome;
                    img.src = sk.imgInv;
                    img.addEventListener('click', function(e){self.socket.emit("doSkill", sk.nome);});
                    img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
                    img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
                    img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                    img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                    atrTooltip(img, sk.commento);
                    div.appendChild(img);


                //migliora
                let div2 = document.createElement("DIV");
                    div2.id = "ricarica_"+sk.nome+"_migliora";
                    div2.classList.add("abi-refresh-delete");
                    div2.classList.add("x64");
                    div2.style.backgroundColor = "rgba(255, 0, 0, 0)";
                    n_td.appendChild(div2);
                let img2 = document.createElement("IMG");
                    img2.classList.add("img-blocks");
                    img2.classList.add("abi-refresh-delete");
                    img2.classList.add("x64");
                    img2.id = sk.nome+"img";
                    img2.src = sk.imgInv;
                    img2.addEventListener('click', function(e){self.socket.emit("miglioraSkill", sk.nome);});
                    img2.addEventListener('mouseover', function(e){
                        document.getElementById("commento_skill").innerHTML = sk.commento_dettagliato;
                        this.style.opacity = 0.5;});
                    img2.addEventListener('mouseout', function(e){
                        document.getElementById("commento_skill").innerHTML = "";
                        this.style.opacity = 1;
                    });
                    img2.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                    img2.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                    //atrTooltip(img2, sk.commento);
                    div2.appendChild(img2);
            }

            /*
           
            DA MODIFICARE, NON CAMBIA IL TESTO DOPO AVER MIGLIORATPO UNA SKILL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            
            */

            let img2 = document.getElementById(sk.nome+"img");
            img2.addEventListener('mouseover', function(e){
                document.getElementById("commento_skill").innerHTML = sk.commento_dettagliato;
                this.style.opacity = 0.5;
            });
        }
    }

    self.refreshRender();
    
    return self;
}