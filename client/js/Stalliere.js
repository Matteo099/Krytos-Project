Stalliere = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        id:param.id,

        pet:param.pet, //true or false
        commento:"",
        commentoSkill:"",
        skill:[]
    }

    self.getCommento = function(){
        for(var i in Pet.list)
            if(Pet.list[i].parent == self.id)
                self.commento = "<span class='titoloSkill'>"+Pet.list[i].nome+"</span><br><br>livello: "+Pet.list[i].livello+"<br>range: "+Pet.list[i].range+"<br>speed: "+Pet.list[i].speed+"<br>damage: "+Pet.list[i].damage+"<br>regHp: "+Pet.list[i].regHp+"<br>regMp: "+Pet.list[i].regMp+"<br>atk speed: "+Pet.list[i].atkSpd+"<br>tempo attacco: "+Pet.list[i].timeToAttack/1000+" sec.<br>tempo super attacco: "+Pet.list[i].timeToSuperAttack/1000+" sec.<br>numero colpi super attacco: "+Pet.list[i].numShotSuperAttack+"<br>colpi speed: "+Pet.list[i].bulletSpeed+"<br>tempo colpi: "+Pet.list[i].bulletTimeToRemove+"<br>abilita: "+Pet.list[i].abilita.toString();;

        self.refreshRender();
    }
    self.getCommentoSkill = function(){
        for(var i in Pet.list){
            if(Pet.list[i].parent == self.id){
                let a = search_name(Pet.list[i].magia.nome, pet_skills);

                for(var j in a.miglioramenti){
                    let m = a.miglioramenti[j];
                    if(j == Pet.list[i].magia.livello){
                        a.timeToReuse = m.timeToReuse;
                        a.timeEffect = m.timeEffect;
                        a.numeroColpi = m.numeroColpi;
                        a.range = m.range;
                        a.ratio = m.ratio;
                        a.bonus = m.bonus;
                    }
                }

                self.commentoSkill = "<span class='titoloSkill'>"+a.commento+"</span><br><br>livello: "+a.livello+"<br>mp utilizzati: "+a.mpUsed+"<br>durata effetto: "+a.timeEffect/1000+" sec.<br>tempo ricarica: "+a.timeToReuse/1000+" sec.<br>range: "+a.range+"px <br>colpi: "+a.numeroColpi+"<br>bonus: +"+a.bonus.hp+" hp, +"+a.bonus.mp+" mp, +"+a.bonus.damage+" atk, +"+a.bonus.defence+" def, +"+a.bonus.regHp+" regHp, +"+a.bonus.regMp+" regMp <br><br><span class='spiegazioneSkill'>"+a.spiegazione+"</span>";
                break;
            }
        }
        self.refreshRender();
    }

    self.getSkill = function(){
        for(var i in Pet.list){
            if(Pet.list[i].parent == self.id){
                self.skill = [];

                if(!Pet.list[i].magia || Pet.list[i].magia == null){

                    for(var s in pet_skills){
                        let ab = pet_skills[s];
                        self.skill.push({commento:ab.commento, spiegazione:ab.spiegazione, nome:ab.nome, imgInv:ab.imgInv, miglioramenti:ab.miglioramenti});
                    }
                    //self.skill = pet_skills;
                }
                else{       
                    let a = search_name(Pet.list[i].magia.nome, pet_skills);

                    for(var j in a.miglioramenti){
                        let m = a.miglioramenti[j];
                        if(j == Pet.list[i].magia.livello){
                            a.timeToReuse = m.timeToReuse;
                            a.timeEffect = m.timeEffect;
                            a.numeroColpi = m.numeroColpi;
                            a.range = m.range;
                            a.ratio = m.ratio;
                            a.bonus = m.bonus;

                            break;
                        }
                    }

                    self.skill.push({commento:a.commento, spiegazione:a.spiegazione, nome:a.nome, 
                        imgInv:a.imgInv, timeToReuse:a.timeToReuse, timeEffect:a.timeEffect, 
                        numeroColpi:a.numeroColpi, miglioramenti:a.miglioramenti, range:a.range,
                        ratio:a.ratio, bonus:a.bonus});

                }
                
            }
        } 

        self.refreshRender();
    }
    self.refreshPet = function(pet){
        self.pet = true;

        self.getCommento(); 
        self.getSkill();

        self.refreshRender();
    }
    self.getPet = function(){
        let obj = {};
        for(var i in Pet.list){
            if(Pet.list[i].parent == self.id){
                let pet = Pet.list[i];

                //console.log(pet.magia);

                if(pet.magia != null) return {nome:pet.nome, livello:pet.livello, magia:{nome:pet.magia.nome, livello:pet.magia.livello}};
                else return {nome:pet.nome, livello:pet.livello, magia:null};
            }
        }
    }
    
    self.refreshRender = function(){
		//server
		if(self.server){
			self.socket.emit('updateStalliere', {pet:self.pet, commento:self.commento, skill:JSON.stringify(self.skill), commentoSkill:self.commentoSkill});
			return;
		}

        //client only
        self.drawAbiPet();
    }

    if(self.server){
        
        self.socket.on("miglioraPet", function(){

            let pet;
            for(var i in Pet.list)
                if(Pet.list[i].parent == self.id)
                    pet = Pet.list[i];
            
            let m = search_name(pet.nome, pets);
            pet.miglioramenti = m.miglioramenti;

            let nextLevel = pet.livello+1;
            let miglioramento;

            for(var q in pet.miglioramenti){
                if(q == nextLevel){
                    miglioramento = pet.miglioramenti[q];
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
                        msg:"Sei sicuro di voler aumentare di un livello <span class='titoloSkill'>"+pet.nome+"</span> (lv."+pet.livello+" -> lv."+nextLevel+")?<br>Item necessari:<br>"+miglioramento.monete+" monete,<br>"+miglioramento.gemme+" gemme,<br>"+miglioramento.esperienza+" esperienza,<br>"+res2+".", 
                        emit:{
                            nome:"verificaMiglioraPet",
                            bool:true
                        }
                    }
                );
            }else{
                self.socket.emit("alert", "Pet al livello massimo");
            }
        });

        self.socket.on("verificaMiglioraPet", function(){

            let player = Player.list[self.socket.id];

            let pet;
            for(var i in Pet.list)
                if(Pet.list[i].parent == self.id)
                    pet = Pet.list[i];

            let m = search_name(pet.nome, pets);
            pet.miglioramenti = m.miglioramenti;
        
            let nextLevel = pet.livello+1;
            let miglioramento;
            let migliora = true;

            for(var q in pet.miglioramenti){
                if(q == nextLevel){
                    miglioramento = pet.miglioramenti[q];
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
                self.socket.emit("alert", "Pet al livello massimo");
            }



            if(migliora){

                self.socket.emit("alert", "Pet migliorato!");

                for(var j in miglioramento.items){
                    let itm = miglioramento.items[j];
                    player.inventory.removeItem(itm.nome, itm.quantita);
                }
                player.esperienza -= miglioramento.esperienza;
                player.monete -= miglioramento.monete;
                player.gemme -= miglioramento.gemme;
                

                //for(var i in Pet.list){
                //    if(Pet.list[i].parent == player.id){

                        pet.livello = nextLevel;
                        pet.abilita = miglioramento.abilita;
                        pet.range = miglioramento.range;
                        pet.speed = miglioramento.speed;
                        
                        pet.damage = miglioramento.bonus.damage;
                        pet.regMp = miglioramento.bonus.regMp;
                        pet.regHp = miglioramento.bonus.regHp;
                        pet.atkSpd = miglioramento.bonus.atkSpd;
                        pet.timeToAttack = miglioramento.bonus.timeToAttack;
                        pet.timeToSuperAttack = miglioramento.bonus.timeToSuperAttack;
                        pet.numShotSuperAttack = miglioramento.bonus.numShotSuperAttack;
                        pet.bulletSpeed = miglioramento.bonus.bulletSpeed;
                        pet.bulletTimeToRemove = miglioramento.bonus.bulletTimeToRemove;
                    
                        self.getCommento();
                    
                              

            }
        });

        self.socket.on("skillPet", function(nome){
            let pet;
                for(var i in Pet.list)
                    if(Pet.list[i].parent == self.id)
                        pet = Pet.list[i];

            if(pet.magia != null && self.skill.length == 1){
                //miglioraskill
                
                let nextLevel = pet.magia.livello+1;
                let miglioramento;


                for(var q in self.skill[0].miglioramenti){
                    //console.log(q,nextLevel);
                    if(q == nextLevel){
                        miglioramento = self.skill[0].miglioramenti[q];
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
                            msg:"Sei sicuro di voler aumentare di un livello <span class='titoloSkill'>"+self.skill[0].nome+"</span> (lv."+pet.magia.livello+" -> lv."+nextLevel+")?<br>Item necessari:<br>"+miglioramento.monete+" monete,<br>"+miglioramento.gemme+" gemme,<br>"+miglioramento.esperienza+" esperienza,<br>"+res2+".", 
                            emit:{
                                nome:"verificaMiglioraSkillPet",
                                bool:true
                            }
                        }
                    );
                }else{
                    self.socket.emit("alert", "Abilita pet al livello massimo"+nextLevel);
                }

            }else{
                //addSkillPet
                self.skill = [];
                let a = search_name(nome, pet_skills);
                self.skill.push(a);

                pet.magia = {nome:nome, livello:0};

                self.getCommentoSkill();
                //self.refreshRender();
            }
        });

        self.socket.on("verificaMiglioraSkillPet", function(){

            let player = Player.list[self.socket.id];
            let pet;
            for(var i in Pet.list)
                if(Pet.list[i].parent == self.id)
                    pet = Pet.list[i];

            let migliora = true;
            let nextLevel = pet.magia.livello+1;
            let miglioramento;

            for(var q in self.skill[0].miglioramenti){
                if(q == nextLevel){
                    miglioramento = self.skill[0].miglioramenti[q];
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
                self.socket.emit("alert", "Abilita pet al livello massimo");
            }



            if(migliora){

                self.socket.emit("alert", "Abilita pet migliorata!");

                for(var j in miglioramento.items){
                    let itm = miglioramento.items[j];
                    player.inventory.removeItem(itm.nome, itm.quantita);
                }
                player.esperienza -= miglioramento.esperienza;
                player.monete -= miglioramento.monete;
                player.gemme -= miglioramento.gemme;
                
                pet.magia.livello = nextLevel;
                pet.magia.timeToReuse = miglioramento.timeToReuse;
                pet.magia.timeEffect = miglioramento.timeEffect;
                pet.magia.numeroColpi = miglioramento.numeroColpi;
                pet.magia.range = miglioramento.range;
                pet.magia.ratio = miglioramento.ratio;
                pet.magia.bonus = miglioramento.bonus;

                self.getCommentoSkill();
            }
        });

        self.socket.on("eliminaPet", function(){
            self.socket.emit("confirm", 
                    {
                        msg:"Sei sicuro di voler elminare definitivamente il tuo pet?", 
                        emit:{
                            nome:"verificaEliminaPet",
                            bool:true
                        }
                    }
                );
        });
        self.socket.on("verificaEliminaPet", function(){
            Player.list[self.socket.id].removePet();
            self.pet = false;
            self.refreshRender();

            self.socket.emit("alert", "Pet eliminato con successo!");
        });

    }

    self.drawAbiPet = function(){

        if(!self.pet){
            document.getElementById("hasntPet").style.display = "block";
            document.getElementById("hasPet").style.display = "none";
        }else{
            document.getElementById("hasntPet").style.display = "none";
            document.getElementById("hasPet").style.display = "block";

            document.getElementById("status_pet_text").innerHTML = self.commento;

            var elements = document.getElementsByClassName("abiPet-refresh-delete");
            while (elements.length > 0) elements[0].remove();

            let div = document.getElementById("allAbiPet");

            for(var i in self.skill){
                let sk = self.skill[i], comm = "";
                let a = sk;

                if(self.skill.length == 1) comm = self.commentoSkill;
                else comm = "<span class='titoloSkill'>"+a.commento+"</span><br><br><span class='spiegazioneSkill'>"+a.spiegazione+"</span>";

                let img = document.createElement("IMG");
                    img.classList.add("img-blocks");
                    img.classList.add("abiPet-refresh-delete");
                    img.classList.add("x64");
                    img.id = sk.nome;
                    img.src = sk.imgInv;
                    img.addEventListener('click', function(e){self.socket.emit("skillPet", sk.nome);});
                    img.addEventListener('mouseover', function(e){
                        document.getElementById("spiegAbiPet").innerHTML = comm;
                        this.style.opacity = 0.5;
                    });
                    img.addEventListener('mouseout', function(e){
                        document.getElementById("spiegAbiPet").innerHTML = "";
                        this.style.opacity = 1;
                    });
                    img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                    img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                    div.appendChild(img);
            }
        }
    }

    if(self.server && self.pet){ 
        self.getCommento(); 
        self.getSkill();
    }else self.refreshRender();
    
    return self;
}