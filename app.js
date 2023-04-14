/*
START XAMPP:
c:\xampp\xampp_start.exe

START MONGODB 
start "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"

START GOOGLE (localhost:2000)
start chrome "http://localhost:2000"

START SERVER
node app

CLEAR 
cls
*/



global_config = require('./server/json/global_config.json');
quests = require('./server/json/quests.json');
skills = require('./server/json/skills.json');
pet_skills = require('./server/json/pet_skills.json');
enemys = require('./server/json/enemys.json');
npcs = require('./server/json/npcs.json');
maps = require('./server/json/maps.json');
dungeons = require('./server/json/dungeons.json');
heroes = require('./server/json/heroes.json');
items = require('./server/json/items.json');
pets = require('./server/json/pets.json');
minions = require('./server/json/minions.json');
require('./server/json/search');
require('./server/Comands');

numberPlayerOnline = 0;

require('./server/b64');
require('./server/Entity');
require('./client/js/Inventory');
require('./client/js/Ability');
require('./client/js/Mondo');
require('./client/js/NPCNegozio');
require('./client/js/Missioni');
require('./client/js/Group');
require('./client/js/Trade');
require('./client/js/Stalliere');

var express = require('express');
require('./server/DatabaseMongoDB');

var app = express();
var serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

let port = process.env.PORT;
if (port == null || port == "") {
    port = 2000;
}
serv.listen(port);
console.log("Server started!");

var DEBUG = true;


//CREAZIONE MAPPE LOGICA E FISICA (caricamento e definizione di oggetti, tiles, e collision blocks)
for (var i in maps) {
    maps[i].json = {};
    maps[i].Object = [];
    maps[i].Collision = {};
    maps[i].Tiles = {};
    maps[i].Tilesets = {};

    maps[i].json = require('./server/json/worlds/' + i + '.json');
    //console.log(maps[i].json);
    let data = maps[i].json;
    maps[i].Object = addObjects(data.layers);
    maps[i].Collision = addCollision(data.layers);
    maps[i].Tiles = getArrayTiles(data.tilesets, i);
    maps[i].Tilesets = data.tilesets;

    let enemy_spawn = [], npc_ = [];
    for (var j in maps[i].Object) {
        if (maps[i].Object[j].name == "Spawn" && maps[i].Object[j].type == "Enemy") {
            enemy_spawn.push(maps[i].Object[j]);
        }
        if (maps[i].Object[j].type == "NPC") {
            npc_.push(maps[i].Object[j]);
        }
    }

    createWorld(
        enemy_spawn,
        i,
        npc_
    );
}


//CREAZIONE DUNGEON SOLO LOGICA (fisica deve essere fatta volta per volta)
for (var i in dungeons) {
    dungeons[i].json = {};
    dungeons[i].Object = [];
    dungeons[i].Collision = {};
    dungeons[i].Tiles = {};
    dungeons[i].Tilesets = {};

    dungeons[i].json = require('./server/json/dungeons/' + i + '.json');
    let data = dungeons[i].json;
    dungeons[i].Object = addObjects(data.layers);
    dungeons[i].Collision = addCollision(data.layers);
    dungeons[i].Tiles = getArrayTiles(data.tilesets, i);
    dungeons[i].Tilesets = data.tilesets;

}


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('singIn', function (data) { //data {email:"",password:""}
        Database.isValidPassword(data, function (res) {

            for (var i in Player.list)
                if (Player.list[i].username == res.username)
                    return socket.emit("singInResponse", { success: false, text: "Account già online" });

            if (!res.result)
                return socket.emit("singInResponse", { success: false, text: "Email o password sbagliata!" });

            console.log("Player connected: " + res.email);
            Database.getPlayerProgress(res.email, function (progress) {
                numberPlayerOnline++;
                let inventory_items = [];
                for (var i in progress.items)
                    inventory_items.push({ id: progress.items[i].id, item: search_name(progress.items[i].id, items), amount: progress.items[i].amount });

                let short_inv = [];
                for (var i in progress.short_inv)
                    short_inv.push({ id: progress.short_inv[i].id, item: search_name(progress.short_inv[i].id, items), amount: progress.short_inv[i].amount });

                let equip_items = {};
                progress.equip?.arma != null ? equip_items.arma = { id: progress.equip.arma, item: search_name(progress.equip.arma, items), i: 22 } : null;
                progress.equip?.elmo != null ? equip_items.elmo = { id: progress.equip.elmo, item: search_name(progress.equip.elmo, items), i: 21 } : null;
                progress.equip?.armatura != null ? equip_items.armatura = { id: progress.equip.armatura, item: search_name(progress.equip.armatura, items), i: 24 } : null;
                progress.equip?.collana != null ? equip_items.collana = { id: progress.equip.collana, item: search_name(progress.equip.collana, items), i: 20 } : null;
                progress.equip?.anello != null ? equip_items.anello = { id: progress.equip.anello, item: search_name(progress.equip.anello, items), i: 23 } : null;

                let hero = search_name(progress.hero?.class || "Iniziale", heroes);

                let data_hero = {};
                if (progress?.hero !== undefined) data_hero = progress.hero;
                data_hero.animation = hero.animation;

                let map = {};
                map = maps[data_hero.map];

                if (!map) {
                    map = maps["Citta"]; //se prima di sloggare si trovava in un dungeon (mappa che dopo 15 minuti viene cancellata)
                    data_hero.x = 500;
                    data_hero.y = 500;
                }


                if (progress.missioni?.missioni !== undefined) {
                    for (var i in progress.missioni.missioni) {
                        let miss = search_name(progress.missioni.missioni[i], quests);
                        if (miss) {
                            miss.id = progress.missioni.missioni[i];
                            progress.missioni.missioni[i] = miss;
                        }
                    }
                }else {
                    progress.missioni = {missioni:[], missioniCompletate:[], mostri:[]}
                }

                progress = {
                    items: inventory_items,
                    short_inv: short_inv,
                    equip: equip_items,
                    skill: progress.skill,
                    missioni: progress.missioni
                };

                Player.onConnect(
                    socket,
                    res.username,
                    res.email,
                    progress,
                    data_hero,
                    map
                );
                socket.emit("singInResponse", { success: true });
            });
        });
    });
    socket.on('singUp', function (data) {
        Database.isUsernameTaken(data, function (res, text) {
            if (res) {
                socket.emit("singUpResponse", { success: false, text: text });
            } else {
                Database.addUser(data, function () {
                    console.log("New user registered");
                    socket.emit("singUpResponse", { success: true, text: text });
                });
            }
        });
    });

    socket.on('disconnect', function () {
        numberPlayerOnline--;
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('close', function () {
        console.log("Server closed!");
    });

    socket.on('howping', function () {
        //console.log("pong");
        socket.emit('howpong');
    });

    socket.on('evalServer', function (data) {
        if (!DEBUG) return;

        var res = eval(data);
        socket.emit("evalAnsware", res);
    });
});


setInterval(function () {
    var packs = Entity.getFrameUpdateData();
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove', packs.removePack);
    }

}, 1000 / 25);