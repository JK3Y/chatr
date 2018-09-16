# chatr
Dynamically create disposable chat rooms based on a URL. 

Discreet. Disposable. No logging of any kind.

![](/screenshots/home.png?raw=true)

## Usage
Chat rooms can be created and shared using a simple URL. They can also be joined if there is at least 1 user inside the chat room.

![](/screenshots/chatroom.png?raw=true)

Chat rooms are destroyed when all users have left the chat.

## Building
To build Chatr from source, a few things have to be installed:
* [Node](https://nodejs.org) >= 5.11
* [NPM](https://www.npmjs.com) >= 3.8.8
* [Bower](http://bower.io) >= 1.7.9


Install dependencies with:
```
npm install && bower install
```

Run with:
```
node index.js
```