Mondo = function(param){

    var self = {
		socket: param.socket,
		server: param.server,
        mondo: param.mondo,
        mondocreato: false
    }

    self.loadSpritesheet = function(params){
        let len =  params.length;
        let Imgs = [];
        for(var i in params){
            let param = params[i];
            Imgs[param.name] = new Image();
            Imgs[param.name].src = param.image;
        }
    
        return Imgs;
    }

    self.mondo_drawLayer = function(layer,coor){

        let x = 0, y = 0;
        let _x = coor.x, _y = coor.y;
    
        for(var j in layer.data){
    
            let id = layer.data[j];
    
            if(id){
                let tile = coor.tiles[id],
                    width = tile.width,
                    height = tile.height;
    
                coor.ctx.drawImage(coor.Imgs[tile.imgname],
                    tile.sx,tile.sy,tile.width,tile.height,
                    x*width+_x,y*height+_y,width,height);
    
            }
            //else spazio vuoto
    
            x++; 
            if(x>=layer.width){x=0;y++}
        }
    }
    
    self.mondo_draw = function(_x,_y, params, ctx){
    
        var param = params.json;
    
        for(var i in param.layers){
            let layer = param.layers[i];
    
            if(layer.type == "tilelayer"){
                if(!layer.name.includes("Above")){
                    if(layer.name != "Collision"){
                        self.mondo_drawLayer(layer, {x:_x, y:_y, ctx: ctx, Imgs: params.Imgs, tiles: params.Tiles});
                    }
                }
            }
        }
    }
    
    self.mondo_drawAbove = function(_x,_y, params, ctx){
    
        var param = params.json;
    
        for(var i in param.layers){
            let layer = param.layers[i];
    
            if(layer.type == "tilelayer"){
                if(layer.name.includes("Above")){
                    if(layer.name != "Collision"){
                        self.mondo_drawLayer(layer, {x:_x, y:_y, ctx: ctx, Imgs: params.Imgs, tiles: params.Tiles});
                    }
                }
            }
        }
    }


    self.refreshRender = function(opt){
		//server
		if(self.server){
            
			self.socket.emit('updateMondo', {mondo: JSON.stringify(self.mondo)});
			return;
		}

        //client only
        if(opt){
            if(!self.mondocreato) self.creaMondo();
            self.drawMondo(opt);
        }
    }

    self.changeMap = function(param){
        if(param) self.mondo = param;
        self.mondocreato = false;
        self.refreshRender();
    }

    self.creaMondo = function(param){
        if(param) self.mondo = param;
        self.mondo.Imgs = self.loadSpritesheet(self.mondo.Tilesets);
    }

    self.drawMondo = function(opt){
        if(opt.n==1){
            self.mondo_draw(opt.x,opt.y,self.mondo, opt.ctx);
        }   
        if(opt.n==2){
            self.mondo_drawAbove(opt.x,opt.y,self.mondo, opt.ctx);
        }     
    }

    self.refreshRender();
    
    return self;
}