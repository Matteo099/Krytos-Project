# Krytos-Project
Krytos Project is an immersive 2D MMORPG game that takes inspiration from Metin2. 
Set in a fantastical world, players embark on an epic journey to explore vast landscapes, battle fierce monsters, and interact with a vibrant community of players.

## About the project
The project was developed using Nodejs, HTML5, Express.js, MongoJS, and Socket.io libraries, and it provides both client and server files.

Please note that the project is no more in development (it was developed when I was 17 years old :D), it is not complete and I do not assume any responsibility for any bugs or issues that may arise.

## Requirements
In order to run the game you need:

- Node js
- npm
- MongoDB Server

## Setup
In order to run the game:
1. Clone the repository (download or clone)
2. Open the project directory on a terminal and run the command `` npm install ``

Before starting the game you need to create the database:
1. Start MongoDB Server
2. Create a new Database with the name `` myGame ``
3. Create 2 collections inside called `` account `` and `` progress ``

Now you can return to the project directory and run the command `` node app ``. 
This command will start the game server & client. 
The client is available at the address `` localhost:2000 ``.

You can open multiple `` localhost:2000 `` pages to test also the multiplayer feature!

## Commands
The game provide also some commands (cheats) that are defined in the file `` Server/Comands.js ``. The commands can be executed in-game thought the chat, usign the patter `` /commandName(param1, param2, ...) ``. An example: `` /gold("PlayerName", 100) `` this comand will add 100 gold to the player 'PlayerName'. <br> You can use this command to quikly discover the game features (ability, pet, levels, maps, items...). The command usually refers to an item_id that you can find inside the folder `` json ``. 

## Screenshot
Here are some screenshot of the game. The screenshot are not exaustive, there are some feature not showed (like the minions, the pet abilities and evolution, the ability system, the bosses, the NPC like the warehouse or the pet helper).

### Register & Login
![Register](doc/register.png?raw=true)

### First login
![Forest](doc/first_login.png?raw=true)

### Maps
![Town](doc/town.png?raw=true)
![Forest](doc/forest1.png?raw=true)
![Desert](doc/desert.png?raw=true)

### Dungeon
![Dungeon](doc/dungeon.png?raw=true)
![Dungeon boss](doc/dungeon2.png?raw=true)

### Skills & Attacks
Here is showed only 1 skill, also if there are about 8 skills implemented. To get the skill you need to do the mission 3 that gives you a character transformation stone: you can become magician, knight, summoner... Once you evolve, you can use the cheats to add some skills (see Commands sections).
![Skill1](doc/skill1.png?raw=true)
![Skill2](doc/skill2.png?raw=true)
![Skill Improve](doc/skill_improve.png?raw=true)
![Attack](doc/forest2.png?raw=true)

### GUI
![GUI1](doc/status.png?raw=true)
![Inventory](doc/inventory.png?raw=true)
![Inventory](doc/mission.png?raw=true)
![NPC](doc/teleporter.png?raw=true)

### Multiplayer
![multiplayer](doc/multiplayer.png?raw=true)
![group](doc/group.png?raw=true)
![group2](doc/group2.png?raw=true)
![trading](doc/trading.png?raw=true)
![trading2](doc/trading2.png?raw=true)

### Pet
![pet](doc/pet.png?raw=true)
![Pet attack](doc/pet_attack.png?raw=true)

## Arts
This game uses images taken from the web. I am unsure of the original sources of the images and do not intend to infringe any copyright. If anyone has information on the sources of the images used, please contact me to resolve any copyright issues :pray:.
