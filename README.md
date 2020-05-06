### vpn-management-backend

Backend of VPN Management Project running the backend server, serving all clients in real time using web socket technology.
Written in Node.js using libraries such as socket.io, and express web server.
Currently there are two json files in the "data" folder ( "data.json", and "timerIntevals.json"), to persist changes
made by frontend react.js application. Do not change these two files manually. All the changes must be made by frontend react.js application.

There is a separate repo called 'vpn-management-frontend' to run the front end (https://github.com/ali-sadri/vpn-management-frontend). To run the application, run the backend server (this repo) along with front end.

Pleaser refer to the following demo video on for full understanding of Application (backend + frontend).

### Install dependencies

After clone/download of project, run "npm i" to install all dependencies.

### Run the server

run "npm start" to start the server. server will start listening on port 3001.
