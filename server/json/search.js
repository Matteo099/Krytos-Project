search_id_value = function(id, value, file){
    var result = [];

    for(var i in file){
        var array = Object.entries(file[i]);
        array.forEach(element => {
            //console.log(element[0], element[1]);
            if(element[0] == id && element[1] == value){
                result.push(file[i]);
            }
        });
    }
    //console.log(result);
    return result;
}

search_enemysOfMap = function(name, file){
    var result = [];

    for(var i in file){
        let array = file[i].maps;
        array.forEach(element => {
            if(element.name == name){
                file[i].quantita = element.quantita;
                result.push(file[i]);
            }
        });
    }
    return result;
}

search_name = function(name, file){
    return file[name];
}


/*

enemys = [{
    nome: "Ape2",
    img_bullet: "client/img/bullet.png",
    hp: 3,
    defence: 0,
    damage: 1,
    speed: 2,
    speed_attacco: 2,
    time_to_attack: 25,
    time_to_super_attack: 1000,
    num_shot_super_attack: 3,
    animatio_speed: 0.2,
    frame_width: 3,
    frame_height: 4,
    speed_bullet: 10,
    bullet_time_to_remove: 40,
    range_attacco: 200,
    animation_idle: {
        id: 5,
        img_right: "client/img/bee/cammino_right.png",
        img_left: "client/img/bee/cammino_left.png",
        img_up: "client/img/bee/cammino_up.png",
        img_down: "client/img/bee/cammino_down.png",
        property: {"nfrW_right":3,"nfrH_right":1,"aS_right":0.2,"ratio_right":2,"nfrW_left":3,"nfrH_left":1,"aS_left":0.2,"ratio_left":2,"nfrW_up":3,"nfrH_up":1,"aS_up":0.2,"ratio_up":2,"nfrW_down":3,"nfrH_down":1,"aS_down":0.2,"ratio_down":2},
        tipo: "idle"
    },
    animation_walking: {
        id: 6,
        img_right: "client/img/bee/cammino_right.png",
        img_left: "client/img/bee/cammino_left.png",
        img_up: "client/img/bee/cammino_up.png",
        img_down: "client/img/bee/cammino_down.png",
        property: {"nfrW_right":3,"nfrH_right":1,"aS_right":0.2,"ratio_right":2,"nfrW_left":3,"nfrH_left":1,"aS_left":0.2,"ratio_left":2,"nfrW_up":3,"nfrH_up":1,"aS_up":0.2,"ratio_up":2,"nfrW_down":3,"nfrH_down":1,"aS_down":0.2,"ratio_down":2},
        tipo: "walking"
    },
    quantita: 5,
    map: "forest"
}];
*/


//PER LA CREAZIONE DEI FILE DA INVIARE AL CLIENT

getArrayTiles = function(params, name) {
    let len =  params.length;
    let tiles = {};

    for(var i in params){
        let param = params[i];

        var x = 0, y = 0;

        for(var i=param.firstgid;i<(param.tilecount+param.firstgid);i++){
            tiles[i] = {
                sx: x*param.tilewidth,
                sy: y*param.tileheight,
                width: param.tilewidth,
                height: param.tileheight,
                imgname: param.name,
            };

            x++;
            if(x >= param.columns){x = 0; y++;}
        }
    }

    console.log(name+" loaded!");
    
    return tiles;
}    

loadSpritesheet = function(params){
    let len =  params.length;
    let Imgs = [];
    for(var i in params){
        let param = params[i];
        Imgs[param.name] = new Image();
        Imgs[param.name].src = param.image;
    }

    return Imgs;
}

addObjects = function(param){
    for(var i in param){
        let layer = param[i];
        if(layer.type == "objectgroup") return layer.objects;
    }
}

addCollision = function(param){

    for(var i in param){
        let layer = param[i];
        if(layer.type == "tilelayer" && layer.name == "Collision") return layer;//layer.data = []
    }
}