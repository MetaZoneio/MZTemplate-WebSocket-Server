'use strict';

const express = require('express')
const cors = require('cors')
const { Server } = require('ws');

// Retrieve environment variable
const PORT = process.env.PORT || 12000;

// Web Server
const app = express().use(cors())
// Upon request send index.html
.use((req, res) => res.sendFile('/index.html', { root: __dirname+'/../public' }))
// Start web server
.listen(PORT, () => console.log(`MetaZone Websocket Server listening on port ${PORT}`));

// Games list
let games = {};
// Web Socket Server
const wss = new Server({ server: app });

// On Client Connect
wss.on('connection', (client) => {

  // Create player
  let player = {
    id: Math.floor(Math.random() * 999999),
    game_id: '',
    name: '',
    playing: false,
    moving: false,
    x: 0,
    z: 0,
  };
  console.log('Client connected '+player.id);

  // On Receive Message
  client.on('message', (data) => {
    // Parse message
    let msg = JSON.parse(data);
    // Take an action
    switch(msg.action) {

      case 'updatePlayer':
        // Update player data
        player.game_id = msg.data.game_id;
        player.name = msg.data.name;
        player.moving = player.x != msg.data.x || player.z != msg.data.z;
        player.x = msg.data.x;
        player.z = msg.data.z;

        // Make sure game exists
        createGame(player.game_id);
        // Add WebSocket client to broadcast list
        games[player.game_id].clients[player.id] = client
        // Add/Remove player
        checkAddRemovePlayer(player);
        break;
    }
  });

  // On Disconnect
  client.on('close', () => {
    // Disconnect player from game
    if(games.hasOwnProperty(player.game_id)) {
      // Remove player from game players list
      games[player.game_id].players.splice(findPlayer(player.game_id, player.id), 1);
      // Remove the client from game
      delete games[player.game_id].clients[player.id];
    }
    console.log('Client disconnected '+player.id)
  });

});

function createGame(game_id) {
  // Check if game exists
  if(!games.hasOwnProperty(game_id)) {
    console.log('Create Game ', game_id);
    // Create a new game
    const newGame = {
      // WebSocket connections
      clients: {},
      // Players list
      players: []
    };
    // Add game instance
    games[game_id] = newGame;
  }
}
/**
 * Helper function to retrieve a player from a game player list.
 *
 * @param game_id       Game unique identifer
 * @param player_id     Player unique identifer
 */
function findPlayer(game_id, player_id) {
  // Loop through all game players
  for(let i=0; i<games[game_id].players.length; i++) {
    // Find matching player id
    if(player_id == games[game_id].players[i].id)
      return i;
  }
  return -1;
}
/**
 * Player enters and exists game area will add and remove from game player list.
 */
function checkAddRemovePlayer(player) {
  // Retrieve player index
  let playerIndex = findPlayer(player.game_id, player.id);

  // Player inside game arena
  if(player.x > 0 && player.x < 16 && player.z > 0 && player.z < 16) {
    // Make sure not already on list
    if(playerIndex < 0)
      // Place player in game
      games[player.game_id].players.push(player);
  }
  // Player outside game arena
  else {
    // Check is on players list
    if(playerIndex >= 0)
      // Remove player from game players list
      games[player.game_id].players.splice(playerIndex, 1);
  }
}


// Endless Loop
setInterval(() => {
  // Sixty frames per second
  const elapasedTime = 1/60

  // Retrieve all active game instances and update
  Object.keys(games).forEach(game_id => { updateGame(game_id) });

}, 1000/60);


/**
 * Progress the game by elapased time.
 *
 * @param game_id         Unique game identifer
 */
function updateGame(game_id) {
  // Retrieve game
  const game = games[game_id];

  // Loop through all players
  for(let i=0; i<game.players.length; i++) {
    let player = game.players[i];

    // TODO: Update player
  }

  // TODO: Update game

  // Broadcast game state to all game clients
  Object.keys(game.clients).forEach((player_id) => {
    // Send server game state
    game.clients[player_id].send(JSON.stringify({
      players: game.players
    }));
  });
}
