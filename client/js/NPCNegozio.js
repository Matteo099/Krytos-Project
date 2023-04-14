NPCNegozio = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        lastNeg: param.lastNeg,
        nome:param.nome,
        closeAll:param.closeAll,
    }
    
    self.negozi = [];

    for(var i in param.negozi){
        let n = param.negozi[i];
        if(n != null){
            //console.log(n);
            self.negozi[i] = n;
        }
    }
    //console.log(self.negozi);

    self.refreshRender = function(){
		//server
		if(self.server){
            for(var i in self.negozi){
                self.socket.emit('updateNeg', {nome:i, neg:self.negozi[i]}); 
            }

			self.socket.emit('updateNPC', {nome: self.nome, lastNeg:self.lastNeg, closeAll:self.closeAll});
			return;
		}

        //client only
        self.drawNegozi();
    }

    self.drawNegozi = function(){

        if(!trade.isOpen){

            if(inventory.clickItems.option != "Magazzino" && !self.closeAll){
                document.getElementById("inventario").style.display = "none";
                document.getElementById("migliora").style.display = "none";
                document.getElementById("missioni").style.display = "none";
                document.getElementById("group").style.display = "none";
            }
            
            if(self.lastNeg == self.nome) self.openInventory(false);
            else self.openInventory(true);

            if(!self.closeAll) openNPC = true;

            if(self.closeAll){
                //console.log("none");
                openNPC = false;
                inventory.clickItems.bool = true;
                inventory.clickItems.option = "";
                document.getElementById("mag_back").style.display = "block";
                document.getElementById("close_mag").style.display = "block";
                document.getElementById("prendi_mag").style.display = "none";
                document.getElementById("inventarioNPC").style.display = "none";
                document.getElementById("Teleporter").style.display = "none";
                document.getElementById("Fabbro").style.display = "none";
                document.getElementById("Magazzino").style.display = "none";
                document.getElementById("Stalliere").style.display = "none";
            }
        }
    }

    self.openInventory = function(refresh){
        if(self.negozi[self.nome] != null){
            if(refresh) self.drawInventory();
            document.getElementById("inventarioNPC").style.display = "block";
            document.getElementById("Teleporter").style.display = "none";
            document.getElementById("Fabbro").style.display = "none";
            document.getElementById("Magazzino").style.display = "none";
            document.getElementById("Stalliere").style.display = "none";
        }
        else if(self.nome=="Teleporter"){
            document.getElementById("inventarioNPC").style.display = "none";
            document.getElementById("Teleporter").style.display = "block";
            document.getElementById("Fabbro").style.display = "none";
            document.getElementById("Magazzino").style.display = "none";
            document.getElementById("Stalliere").style.display = "none";
        }
        else if(self.nome=="Magazzino"){
            document.getElementById("inventarioNPC").style.display = "none";
            document.getElementById("Teleporter").style.display = "none";
            document.getElementById("Fabbro").style.display = "none";
            document.getElementById("Magazzino").style.display = "block";
            document.getElementById("Stalliere").style.display = "none";
        }
        else if(self.nome=="Fabbro"){
            document.getElementById("inventarioNPC").style.display = "none";
            document.getElementById("Teleporter").style.display = "none";
            document.getElementById("Fabbro").style.display = "block";
            document.getElementById("Magazzino").style.display = "none";
            document.getElementById("Stalliere").style.display = "none";
        }
        else if(self.nome=="Stalliere"){
            document.getElementById("Stalliere").style.display = "block";
            document.getElementById("inventarioNPC").style.display = "none";
            document.getElementById("Teleporter").style.display = "none";
            document.getElementById("Fabbro").style.display = "none";
            document.getElementById("Magazzino").style.display = "none";
        }
    }

    self.drawInventory = function(){

        var elements = document.getElementsByClassName("inv-npc-refresh-delete");
        while (elements.length > 0) elements[0].remove();

        var addButton = function(data, i){
            let td = document.getElementById(i);

            let text = document.createElement("SPAN");
                text.innerText = "x"+data.amount;
                text.style.position="absolute";
                text.classList.add("inv-span");
                text.classList.add("inv-npc-refresh-delete");
                text.classList.add("priorita5");
                td.appendChild(text);
            let img = document.createElement("IMG");
                img.classList.add("img-blocks");
                img.classList.add("inv-npc-refresh-delete");
                img.classList.add("x64");
                img.src = data.item.imgInv;
                img.addEventListener('click', function(e){
                    socket.emit("compraItem", {
                        amount:data.amount, 
                        item:data.item, 
                        id:data.id,
                        gemme:data.gemme,
                        monete:data.monete
                    });
                });
                img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
                img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
                img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
                img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
                atrTooltip(img, data.item.commento);
                td.appendChild(img);
        }

        for(var i in self.negozi[self.nome]){
            let n = self.negozi[self.nome][i];
            addButton({
                amount:n.quantita, 
                item:n.item, 
                id:n.nome,
                gemme:n.valore_gemme,
                monete:n.valore_monete
            }, i+"NPC");
        }

    }
    

    self.refreshRender();
    
    return self;
}