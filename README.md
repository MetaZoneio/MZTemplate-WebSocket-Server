# WebSocket Template

MetaZone template websocket server that can be deployed on Heroku and the MetaZone template scene code that can be deployed in Decentraland where each connects via websockets for multiplayer communication.

## WebSocket Server

To run the server on Heroku follow these steps on a command line.

1. Clone this repository `git clone https://github.com/MetaZoneio/MZTemplate-WebSocket-Server.git`
2. Move to the new repo folder `cd mztemplate-websocket-server`
3. Create a heroku app `heroku create` (must have Heroku CLI installed)
4. Deploy the server code `git push heroku master`
5. Run a heroku web instance `heroku ps:scale web=1`

You now have a WebSocket Server running on Heroku. Run `heroku open` to view.
