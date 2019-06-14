# jsonlog

Super simple JSON logger for Node.js

```js
const log = new Log({ level: 'info' })
log.info('Hello log world!')
```

```json
{"level":"info","time":"2019-06-14T16:32:46.237Z","info":"Hello log world!"}
```
