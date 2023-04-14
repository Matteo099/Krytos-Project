Inventory = function(items, socket, server, inv, equip, short_inv, magazzino, skill){
	magazzino = magazzino || [];
    var self = {
        items: items, // [{id:str, amount:int, item:{}},{}...]
		socket: socket,
		server: server,
		maxItem: 20,
		equip: equip, //{arma:{}, elmo:{}, armatura:{}, collana:{}, anello:{}}
		lastEquip: {arma:null, elmo:null, armatura:null, collana:null, anello:null},
		short_inv: short_inv, //[{id:"PozioneHp", item:{}, amount:1},{}...]
		magazzino: magazzino,
	}

	self.clickItems = {bool:true, option:""};

	self.addItem = function(id, item, amount, cb){

		cb = cb || function(){};

		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();

				cb();
				return;
			}
		}

		if(self.items.length < self.maxItem){
			//self.items.push({id:id,item:item,item_options:item_options,amount:amount});
			self.items.push({id:id, item:item, amount:amount});
			self.refreshRender();

			cb();
			return;
		}else{
			socket.emit("addToChat", "Inventario pieno!");


			let p = Player.list[self.socket.id];
			Drop({
				x: p.x,
				y: p.y,
				map: p.map,
				nome: id,
				item: item,
				quantita: amount
			});
		}
	}
	self.simulateAddItem = function(id){

		for(var i = 0 ; i < self.items.length; i++)
			if(self.items[i].id === id)
				return true;

		if(self.items.length < self.maxItem) 
			return true;

		return false;
	}

	self.removeItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0)
					self.items.splice(i,1);
				self.refreshRender();
				return;
			}
		}    
	}
	
	self.addItem_shortInv = function(id, item, amount, cb){

		cb = cb || function(){};

		for(var i = 0 ; i < self.short_inv.length; i++){
			if(self.short_inv[i].id === id){
				self.short_inv[i].amount += amount;
				self.refreshRender();

				cb();
				return;
			}
		}

		if(self.short_inv.length < 5){
			self.short_inv.push({id:id, item:item, amount:amount});
			self.refreshRender();

			cb();
			return;
		}else socket.emit("alert", "Inventario pieno!");
	}
	self.removeItem_shortInv = function(id,amount){
		for(var i = 0 ; i < self.short_inv.length; i++){
			if(self.short_inv[i].id === id){
				self.short_inv[i].amount -= amount;
				if(self.short_inv[i].amount <= 0)
					self.short_inv.splice(i,1);
				self.refreshRender();
				return;
			}
		}    
	}
	
	self.addItem_Magazzino = function(id, item, amount, cb){

		cb = cb || function(){};

		for(var i = 0 ; i < self.magazzino.length; i++){
			if(self.magazzino[i].id === id){
				self.magazzino[i].amount += amount;
				self.refreshRender();

				cb();
				return;
			}
		}

		if(self.magazzino.length < 20){
			self.magazzino.push({id:id, item:item, amount:amount});
			self.refreshRender();

			cb();
			return;
		}else socket.emit("alert", "Magazzino pieno!");
	}
	self.removeItem_Magazzino = function(id,amount){
		for(var i = 0 ; i < self.magazzino.length; i++){
			if(self.magazzino[i].id === id){
				self.magazzino[i].amount -= amount;
				if(self.magazzino[i].amount <= 0)
					self.magazzino.splice(i,1);
				self.refreshRender();
				return;
			}
		}    
	}

	self.addItemEquip = function(id,item,item_options){
		if(self.server) Player.list[self.socket.id].inventory.removeItem(id,1);

		if(self.equip[item.tipo] == null){
			self.equip[item.tipo] = {id:id,item:item,item_options:item_options};
		}else if(!self.server) alert("pieno");
		
		self.refreshRender();
    }
    self.removeItemEquip = function(id,item,item_options){
		self.equip[item.tipo] = null;
		self.refreshRender();

		self.addItem(id,item,item_options,1);
    }
    self.hasItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
	}
	self.howItem = function(id){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount;
			}
		}  
	}
	self.hasItem_ShortInv = function(id,amount){
		for(var i = 0 ; i < self.short_inv.length; i++){
			if(self.short_inv[i].id === id){
				return self.short_inv[i].amount >= amount;
			}
		}  
		return false;
	}
	self.refreshRender = function(){
		//server
		if(self.server){

			let equip = {};
			equip.arma = self.equip.arma;
			equip.elmo = self.equip.elmo;
			equip.armatura = self.equip.armatura;
			equip.collana = self.equip.collana;
			equip.anello = self.equip.anello;
			//console.log(equip);

			self.socket.emit('updateInventory', {items:self.items, equip:equip, short_inv:self.short_inv, magazzino:self.magazzino, skill:skill});
			return;
		}

		//client only
		//var inventory = document.getElementById("inventory");
		//elimina tutte le immagini e testi dell'inventario con classe inv-refresh-delete
		var elements = document.getElementsByClassName("inv-refresh-delete");
		while (elements.length > 0) elements[0].remove();

		var addButton = function(data, i){
			//console.log(data);
			//self.items.push({id:id,item:item,item_options:item_options,amount:amount});
//			self.items.push({id:id,item:item,amount:amount});

			let td = document.getElementById(i);

			let text = document.createElement("SPAN");
				text.innerText = "x"+data.amount;
				text.style.position="absolute";
				text.classList.add("inv-span");
				text.classList.add("inv-refresh-delete");
				text.classList.add("priorita5");
				td.appendChild(text);
			let img = document.createElement("IMG");
				img.classList.add("img-blocks");
				img.classList.add("inv-refresh-delete");
				img.classList.add("x64");
				img.src = data.item.imgInv;
				img.addEventListener('click', function(e){
					
					if(e.which == 1){ //left
						if(self.clickItems.bool){
							if(data.item.tipo != "utilizzabile" && data.item.tipo != "altro"){
								//equip item	
								if(typeof i === "number") self.socket.emit("equipItem", {id:data.id, item:data.item}, true);
								if(typeof i === "string") self.socket.emit("equipItem", {id:data.id, item:data.item}, false);
							}
							else if(data.item.tipo == "utilizzabile"){
								//usa l'oggetto
								if(typeof i === "number") self.socket.emit("useItem", {id:data.id, item:data.item});
								if(typeof i === "string") self.socket.emit("useItem_ShortInv", {id:data.id, item:data.item});
							}
							//else { oggetto non utilizzabile (per missioni o altro) }
						}else if(self.clickItems.option == "Magazzino"){
							self.socket.emit("insertMagazzino", {id:data.id, item:data.item, amount:data.amount});
						}else if(self.clickItems.option == "Inventario"){
							self.socket.emit("togliMagazzino", {id:data.id, item:data.item, amount:data.amount});
						}
					}
				});
				img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
				img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
				img.addEventListener('mousedown', function(e){
					clearTooltip();
					if(e.which == 3 && typeof i === 'number'){//right
						self.socket.emit("equipItem_ShortInv", {id:data.id, item:data.item, amount:data.amount});
					}
					else if(e.which == 3 && typeof i === 'string'){//right
						self.socket.emit("unEquipItem_ShortInv", {id:data.id, item:data.item, amount:data.amount});
					}

					this.style.transform = "scale(0.9, 0.9)";
				});
				img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
				atrTooltip(img, data.item.commento);
				td.appendChild(img);
		}

		var addButtonEquip = function(data, i){
			let td = document.getElementById(i);
			data.i = i;

			let img = document.createElement("IMG");
				img.id = i+"_img";
				img.classList.add("inv-refresh-delete");
				img.classList.add("img-blocks");
				img.classList.add("x64");
				img.src = data.item.imgInv;
				td.appendChild(img);

				img.addEventListener('click', function(e){
					//console.log("togli item");	
					clearTooltip();
					this.remove();
					self.socket.emit("unEquipItem", {id:data.id, item:data.item});					
				});
				img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
				img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
				img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
				img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
				atrTooltip(img, data.item.commento);
		}

		for(var i = 0 ; i < self.items.length; i++)
			addButton(self.items[i], i);

		for(var i = 0 ; i < self.short_inv.length; i++)
			addButton(self.short_inv[i], "s"+i);

		for(var i = 0 ; i < self.magazzino.length; i++)
			addButton(self.magazzino[i], i+"mag");
		
		//i: 22=arma, 21=elmo, 20=collana, 23=anello, 24=armatura
		if(self.equip.arma && self.lastEquip.arma != self.equip.arma){
			addButtonEquip(self.equip.arma, 22);
			self.lastEquip.arma = self.equip.arma;
		}
		if(self.equip.elmo && self.lastEquip.elmo != self.equip.elmo){
			addButtonEquip(self.equip.elmo, 21);
			self.lastEquip.elmo = self.equip.elmo;
		}
		if(self.equip.collana && self.lastEquip.collana != self.equip.collana){
			addButtonEquip(self.equip.collana, 20);
			self.lastEquip.collana = self.equip.collana;
		}
		if(self.equip.anello && self.lastEquip.anello != self.equip.anello){
			addButtonEquip(self.equip.anello, 23);
			self.lastEquip.anello = self.equip.anello;
		}
		if(self.equip.armatura && self.lastEquip.armatura != self.equip.armatura){
			addButtonEquip(self.equip.armatura, 24);
			self.lastEquip.armatura = self.equip.armatura;
		}
		
	}
	self.open = function(){
		if(!self.server && !trade.isOpen){
			var inventory = document.getElementById("inventario");
			var migliora = document.getElementById("migliora");

			inventory = inventory.style;
			if(inventory.display == "block")
				inventory.display = "none";
			else{
				migliora.style.display = "none";
				document.getElementById("missioni").style.display = "none";
				document.getElementById("group").style.display = "none";

				inventory.display = "block";	
			}
		}
	}

	if(self.server){
		
		self.socket.on("useItem",function(data){
			var p = Player.list[self.socket.id];
			
			if(!self.hasItem(data.id,1)){
				console.log("Cheater: "+p.email+", "+p.username);
				return;
			}


			let cb = function(q){
				q = q || 1;
				return self.removeItem(data.id, q);
			}
			let h = new Function(data.item.function.arguments, data.item.function.body);
			
			h(p,cb);

			self.refreshRender();

		});

		self.socket.on("useItem_ShortInv",function(data){
			var p = Player.list[self.socket.id];
			
			if(!self.hasItem_ShortInv(data.id,1)){
				console.log("Cheater: "+p.email+", "+p.username);
				return;
			}


			let cb = function(q){
				q = q || 1;
				return self.removeItem_shortInv(data.id, q);
			}
			let h = new Function(data.item.function.arguments, data.item.function.body);
			
			h(p,cb);

			self.refreshRender();

		});

		self.socket.on("equipItem",function(data, inv_shinv){

			let itm = data.item;
			let player = Player.list[self.socket.id];
			
			if(player.livello >= itm.livelloMin){
				if(player.livello <= itm.livelloMax){
					if(player.class == itm.classe || itm.classe==""){

						if(itm.tipo == "arma"){
							if(self.equip.arma == null || (data.id != self.equip.arma.id)){	
								//console.log(self.equip.arma, data.id);
								if(self.equip.arma != null && data.id != self.equip.arma.id){

									self.addItem(self.equip.arma.id, self.equip.arma.item, 1, function(){
										
										player.damage -= self.equip.arma.item.bonus.damage;
										player.defence -= self.equip.arma.item.bonus.defence;
										
										player.bulletImgSrc = "client/img/items/bullet.png";
										player.bulletSpeed = 5;
										player.bulletTimeToRemove = 10;
										player.damageMin = 1;
										player.damageMax = 1;
										player.timeToAttack = 300;
										player.timeToSuperAttack = 0;
										player.numShotSuperAttack = 0;
										self.equip.arma = null;
										
										self.refreshRender();
									});

								}
								player.damage += itm.bonus.damage;
								player.defence += itm.bonus.defence;

								player.bulletImgSrc = itm.imgBullet;
								player.bulletSpeed = itm.bulletSpeed;
								player.bulletTimeToRemove = itm.bulletTimeToRemove;
								player.damageMin = itm.damageMin;
								player.damageMax = itm.damageMax;

								player.timeToAttack = itm.timeToAttack;
								player.timeToSuperAttack = itm.timeToSuperAttack;
								player.numShotSuperAttack = itm.numShotSuperAttack;

								self.equip.arma = data;
								if(inv_shinv) self.removeItem(data.id, 1);
								else self.removeItem_shortInv(data.id, 1);
							}
							else socket.emit("alert", "Arma già equipaggiata");
						}
						if(itm.tipo == "elmo"){
							if(self.equip.elmo == null || (data.id != self.equip.elmo.id)){

								if(self.equip.elmo != null && data.id != self.equip.elmo.id){
									self.addItem(self.equip.elmo.id, self.equip.elmo.item, 1, function(){
										player.damage -= self.equip.elmo.item.bonus.damage;
										player.defence -= self.equip.elmo.item.bonus.defence;
										self.equip.elmo = null;
										self.refreshRender();
									});
								}

								player.damage += itm.bonus.damage;
								player.defence += itm.bonus.defence;
								self.equip.elmo = data;
								if(inv_shinv) self.removeItem(data.id, 1);
								else self.removeItem_shortInv(data.id, 1);
							}
							else socket.emit("alert", "Elmo già equipaggiato");
						}
						if(itm.tipo == "armatura"){
							if(self.equip.armatura == null || (data.id != self.equip.armatura.id)){

								if(self.equip.armatura != null && data.id != self.equip.armatura.id){
									self.addItem(self.equip.armatura.id, self.equip.armatura.item, 1, function(){
										player.damage -= self.equip.armatura.item.bonus.damage;
										player.defence -= self.equip.armatura.item.bonus.defence;
										self.equip.armatura = null;
										self.refreshRender();
									});
								}

								player.damage += itm.bonus.damage;
								player.defence += itm.bonus.defence;
								self.equip.armatura = data;
								if(inv_shinv) self.removeItem(data.id, 1);
								else self.removeItem_shortInv(data.id, 1);
							}
							else socket.emit("alert", "Armatura già equipaggiata");
						}
						if(itm.tipo == "collana"){
							if(self.equip.collana == null || (data.id != self.equip.collana.id)){
								
								if(self.equip.collana != null && data.id != self.equip.collana.id){
									self.addItem(self.equip.collana.id, self.equip.collana.item, 1, function(){
										player.damage -= self.equip.collana.item.bonus.damage;
										player.defence -= self.equip.collana.item.bonus.defence;
										player.hpMax -= self.equip.collana.item.bonus.hp;
										player.mpMax -= self.equip.collana.item.bonus.mp;
										self.equip.collana = null;
										self.refreshRender();
									});
								}

								player.damage += itm.bonus.damage;
								player.defence += itm.bonus.defence;
								player.hpMax += itm.bonus.hp;
								player.mpMax += itm.bonus.mp;
								self.equip.collana = data;
								if(inv_shinv) self.removeItem(data.id, 1);
								else self.removeItem_shortInv(data.id, 1);
							}
							else socket.emit("alert", "Collana già equipaggiata");
						}
						if(itm.tipo == "anello"){
							if(self.equip.anello == null || (data.id != self.equip.anello.id)){

								if(self.equip.anello != null && data.id != self.equip.anello.id){
									self.addItem(self.equip.anello.id, self.equip.anello.item, 1, function(){
										player.damage -= self.equip.anello.item.bonus.damage;
										player.defence -= self.equip.anello.item.bonus.defence;
										player.hpMax -= self.equip.anello.item.bonus.hp;
										player.mpMax -= self.equip.anello.item.bonus.mp;
										self.equip.anello = null;
										self.refreshRender();
									});
								}

								player.damage += itm.bonus.damage;
								player.defence += itm.bonus.defence;
								player.hpMax += itm.bonus.hp;
								player.mpMax += itm.bonus.mp;
								self.equip.anello = data;
								if(inv_shinv) self.removeItem(data.id, 1);
								else self.removeItem_shortInv(data.id, 1);
							}
							else socket.emit("alert", "Anello già equipaggiato");
						}
												
						self.refreshRender();

					}else socket.emit("alert", "La tua classe non può indossare questo oggetto, classe richiesta: "+itm.classe);
				}else socket.emit("alert", "Livello troppo alto, livello richiesto: "+itm.livelloMax);
			}else socket.emit("alert", "Livello troppo basso, livello richiesto: "+itm.livelloMin);
		});

		self.socket.on("equipItem_ShortInv",function(data){
			self.addItem_shortInv(data.id, data.item, data.amount, function(){self.removeItem(data.id, data.amount);});
		});
		self.socket.on("unEquipItem_ShortInv",function(data){
			self.addItem(data.id, data.item, data.amount, function(){self.removeItem_shortInv(data.id, data.amount);});
		});

		self.socket.on("insertMagazzino",function(data){
			self.addItem_Magazzino(data.id, data.item, data.amount, function(){self.removeItem(data.id, data.amount);});
		});
		self.socket.on("togliMagazzino",function(data){
			self.addItem(data.id, data.item, data.amount, function(){self.removeItem_Magazzino(data.id, data.amount);});
		});

		self.socket.on("unEquipItem",function(data){
			//console.log("unequip");
			
			self.addItem(data.id, data.item, 1, function(){
				let itm = data.item;
				let player = Player.list[self.socket.id];
	
				player.damage -= itm.bonus.damage;
				player.defence -= itm.bonus.defence;

				if(data.item.tipo == "arma"){
					player.bulletImgSrc = "client/img/items/bullet.png";
					player.bulletSpeed = 5;
					player.bulletTimeToRemove = 10;
					player.damageMin = 1;
					player.damageMax = 1;
					player.timeToAttack = 300;
					player.timeToSuperAttack = 0;
					player.numShotSuperAttack = 0;
					self.equip.arma = null;
				}
				if(data.item.tipo == "elmo"){
					self.equip.elmo = null;
				}
				if(data.item.tipo == "armatura"){
					self.equip.armatura = null;
				}
				if(data.item.tipo == "collana"){
					player.hpMax -= itm.bonus.hp;
					player.mpMax -= itm.bonus.mp;
					self.equip.collana = null;
				}
				if(data.item.tipo == "anello"){
					player.hpMax -= itm.bonus.hp;
					player.mpMax -= itm.bonus.mp;
					self.equip.anello = null;
				}

				self.refreshRender();
			});

		});
		
	}

	self.createInventory = function(){
		let inv = document.getElementById("inventario");
		var tab = document.createElement("TABLE");
		tab.id = "blocksinventory-tab";
		tab.classList.add("inline");
		tab.classList.add("inventory-tab");

			var x = 5, y = 4, count = 0;;
			for(var i=0;i<y;i++){
				let tr = document.createElement("TR");
				for(var j=0;j<x;j++){
					let td = document.createElement("TD");
					td.id = count;
					td.classList.add("x86");
					td.classList.add("inv-block");
					tr.appendChild(td);

					count++;
				}
				tab.appendChild(tr);
			}
		inv.appendChild(tab);

		var tab = document.createElement("TABLE");
		tab.id="equipinventory-tab";
		tab.style.position = "absolute";
		tab.classList.add("inline");
		tab.classList.add("inventory-tab");

			
			for(var j=0;j<3;j++){
				let tr = document.createElement("TR");
				for(var m=0;m<3;m++){
					let td = document.createElement("TD");
					if(j!=2) td.id = count;
					else{
						if(m==0) td.classList.add("invisible");
						if(m==1){
							td.id = "vendi";
							
							let img = document.createElement("IMG");
							img.src = "client/img/vendi.png";
							img.classList.add("img-blocks");
							img.style.width = 86;
							img.style.height = 25.25;
							img.addEventListener('click', function(e){console.log("vendi")});
							img.addEventListener('mouseover', function(e){this.style.opacity = 0.5;});
							img.addEventListener('mouseout', function(e){this.style.opacity = 1;});
							img.addEventListener('mousedown', function(e){this.style.transform = "scale(0.9, 0.9)";});
							img.addEventListener('mouseup', function(e){this.style.transform = "scale(1, 1)";});
							td.appendChild(img);
							m++;
						}
					}
					td.classList.add("x86");
					td.classList.add("inv-block");
					tr.appendChild(td);
					tab.appendChild(tr);
					count++;

					if(j==1 && m==1) m++;
				}	
			}
			
		inv.appendChild(tab);
	}

	if(!server) self.createInventory();

	return self;
}