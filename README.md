# API for [jess.gallery](https://jess.gallery)

This is a Node.js application serving as an API for [jess.gallery](https://jess.gallery), both for the public part and for the CMS.

## Running

In order to run, you'll need node 9.2 – technically, everything starting from 7.6 should work, since I use async/await, but I haven't tried it myself.

Also, you need to have MYSQL installed and running. On mac OS, you need to execute `mysql.server start`.

```
mysql.server start
npm install
npm start
```

