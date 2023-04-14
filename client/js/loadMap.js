function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

var Mappa = {};

Mappa.Imgs = {};
Mappa.Objects = [];
Mappa.collision = {};

Mappa.load = function(json, context, cb){
    json = json || null;

    this.context = context;
    this.cb = cb;
    this.tiles = {};

    var _this = this;

    readTextFile(json, function(text){
        _this.data = JSON.parse(text);
        _this.addObjects(_this.data.layers);
        _this.addCollision(_this.data.layers);
        _this.loadSpritesheet(_this.data.tilesets);
        
        return _this;
    });
}

Mappa.getArrayTiles = function(param,callback) {
    var x = 0, y = 0;

    for(var i=param.firstgid;i<(param.tilecount+param.firstgid);i++){
        this.tiles[i] = {
            sx: x*param.tilewidth,
            sy: y*param.tileheight,
            width: param.tilewidth,
            height: param.tileheight,
            imgname: param.name,
        };

        x++;
        if(x >= param.columns){x = 0; y++;}
    }

    callback(this);
}

Mappa.loadSpritesheet = function(params){
    let len =  params.length;
    for(var i in params){
        let param = params[i];

        this.Imgs[param.name] = new Image();
        this.Imgs[param.name].src = param.image;

        if(i == len-1) this.getArrayTiles(param, function(_this){_this.draw();_this.finish();});
        else this.getArrayTiles(param, function(_this){});
    }
}

Mappa.addObjects = function(param){
    for(var i in param){
        let layers = param[i].layers;

        for(var j in layers){
            let layer = layers[j];

            if(layer.type == "objectgroup") this.Objects.push(layer.objects);
        }
    }
    return;
}

Mappa.addCollision = function(param){

    for(var i in param){
        let layer = param[i];
        if(layer.type == "tilelayer" && layer.name == "Collision") this.collision = layer;//layer.data = []
    }
    return;
}

Mappa.drawLayer = function(layer,coor){
    let x = 0, y = 0, _this = this;
    let _x = coor.x, _y = coor.y;
    for(var j in layer.data){

        let id = layer.data[j];

        if(id){
            let tile = _this.tiles[id],
                width = tile.width,
                height = tile.height;


            /*if(layer.name=="Above1") console.log(_this.Imgs[tile.imgname],
                tile.sx,tile.sy,tile.width,tile.height,
                x*width+_x,y*height+_y,width,height);
            */
            _this.context.drawImage(_this.Imgs[tile.imgname],
                tile.sx,tile.sy,tile.width,tile.height,
                x*width+_x,y*height+_y,width,height);

            /*
            _this.context.drawImage(_this.Imgs[tile.imgname],
                tile.sx,tile.sy,tile.width,tile.height,
                x*width+_x,y*height+_y,width,height);
            */
        }
        //else spazio vuoto

        x++; 
        if(x>=layer.width){x=0;y++}
    }
}

Mappa.draw = function(_x,_y){

    var param = this.data;
    var _this = this;

    for(var i in param.layers){
        let layer = param.layers[i];

        if(layer.type == "tilelayer"){
            if(!layer.name.includes("Above")){
                if(layer.name != "Collision"){
                    //console.log(layer);
                    this.drawLayer(layer, {x:_x, y:_y});
                }
            }
        }
    }
}

Mappa.drawAbove = function(_x,_y){

    var param = this.data;

    for(var i in param.layers){
        let layer = param.layers[i];

        if(layer.type == "tilelayer"){
            if(layer.name.includes("Above")){
                if(layer.name != "Collision"){
                    this.drawLayer(layer, {x:_x, y:_y});
                }
            }
        }
    }

    /*
    for(var i in param.layers){
        let group = param.layers[i];

        if(group.type == "group"){
            for(var j in group.layers){
                let layer = group.layers[j];
                //console.log(layer);
                if(layer.name.includes("Above")) drawLayer(layer);
            }
        }else if(group.type == "tilelayer"){
            if(group.name.includes("Above")) drawLayer(group);
        }
    }
    */
}

Mappa.finish = function(){
    console.log(this);
    this.cb(this);
}