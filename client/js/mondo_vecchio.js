mondo_drawLayer = function(layer,coor){

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

mondo_draw = function(_x,_y, params){

    var param = params.json;

    for(var i in param.layers){
        let layer = param.layers[i];

        if(layer.type == "tilelayer"){
            if(!layer.name.includes("Above")){
                if(layer.name != "Collision"){
                    mondo_drawLayer(layer, {x:_x, y:_y, ctx: params.ctx, Imgs: params.Imgs, tiles: params.Tiles});
                }
            }
        }
    }
}

mondo_drawAbove = function(_x,_y, params){

    var param = params.json;

    for(var i in param.layers){
        let layer = param.layers[i];

        if(layer.type == "tilelayer"){
            if(layer.name.includes("Above")){
                if(layer.name != "Collision"){
                    mondo_drawLayer(layer, {x:_x, y:_y, ctx: params.ctx, Imgs: params.Imgs, tiles: params.Tiles});
                }
            }
        }
    }
}
