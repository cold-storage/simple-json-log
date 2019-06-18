 # simple-json-log

A [JSON](#json) logger for [Node.js](https://nodejs.org).

Light weight. No external dependencies. Great for application code or
[libraries](#library-usage).

## Quick Start

All you need to do is set the `level`. If you don't set the `level` we
do nothing.

```js
const log = new(require('simple-json-log'))({ level: 'info' })
log.info('Hello log world!')
```

Output

```json
{"time":"2019-06-15T08:57:41.016Z","info":"Hello log world!"}
```

## Why?

I want to easily log any object in string format like
[JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

There are two un-helpful things about `JSON.stringify()`.

1. It throws an error if your object has circular references.
2. It doesn't include properties that aren't enumerable.

Another thing I don't like about `JSON.stringify()` is the
[replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter)
lets you specify an array of property names to **include**. I
generally want to **exclude** one or two. I haven't found a use case
where I want to list out all the properties to include.

Finally, I want to be able to specify property **values** to exclude
as well as property names to exclude.

## Examples

Parameters are a string message, followed by a JSON object, followed
by an array of keys you want to remove from the output, followed by an
array of values you want to remove from the output.

```js
log.info('Hello world!')
log.info('Hello world!', { some: 'JSON', password: 'letmein' })
log.info('Hello world!', { some: 'JSON', password: 'letmein' }, ['password'])
log.info('Hello world!', { some: 'JSON', password: 'letmein' }, [], ['letmein'])
log.info({ some: 'JSON', password: 'letmein' })
// If there's only one key or value to remove a string works too.
log.info({ some: 'JSON', password: 'letmein' }, 'password')
log.info({ some: 'JSON', password: 'letmein' }, null, 'letmein')
```

Output

```json
{"time":"2019-06-17T03:03:34.952Z","info":"Hello world!"}
{"time":"2019-06-17T03:03:34.953Z","info":"Hello world!","some":"JSON","password":"letmein"}
{"time":"2019-06-17T03:03:34.953Z","info":"Hello world!","some":"JSON"}
{"time":"2019-06-17T03:03:34.953Z","info":"Hello world!","some":"JSON"}
{"time":"2019-06-17T03:03:34.953Z","some":"JSON","password":"letmein"}
{"time":"2019-06-17T03:03:34.953Z","some":"JSON"}
{"time":"2019-06-17T03:03:34.953Z","some":"JSON"}
```

## Options

**`out`**

Defaults to `process.stdout`. You can use any output stream you like.

**`level`**

Defaults to 'off'. We don't do anything unless you specify a level.

**`levelAsLabel` and `label`**

`levelAsLabel` defaults to `true`.
`label` defaults to 'message'.

If `levelAsLabel` is `true`, we use `level` as the message label.
Otherwise we use `label` as the message label.

**`levelElement`**

Defaults to `false`. If `true` we add a 'level' element to the JSON
output.

**`indent`**

Defaults to `0`. This is the number of spaces to indent the JSON
output.

**`levels`**

Defaults to the following levels. You can specify any levels you like.

```js
{
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
  off: 6
}
```

**`logLevelFile`**

Defaults to null. If set we will read this file and set the log level
based on the file contents on startup and any time the file changes.

File should contain just the log level. Nothing else.

Uses [fs.watchFile()](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watchfile_filename_options_listener)

**`keysToSkip`** and **`valuesToSkip`**

Defaults to []. These are keys (property names) and values that should
always be skipped.

**`timeFn`**

Defaults to a function that outputs `new Date().toISOString()`. If
`false`, we don't add a 'time' element to the JSON output. Use your
own function to format time however you like.

## TODO

* Configurable object structure
* Configurable label names

## Library Usage

To use with a library you could set the `level` based on an
environment variable.

```js
const level = process.env.AWESOME_LIBRARY_LOG_LEVEL || 'off'
```

Or you could use some kind of logic in your library code to load all
the options from a file.

```js
const findUp = require('find-up')
const path = require('path')
const optsPath = findUp.sync('.awesome.library.log.options.js')
const opts = require(path.relative(__dirname, optsPath))
const log = new Logger(opts)
```

There are many other ways your library could use `simple-json-log`. As
long as it doesn't throw errors and does nothing by default it's safe
to use in library code.

## JSON

JSON is really [JSON](https://www.json.org/)

I use the term 'JSON' loosely here to mean simple objects that are
displayed nicely by `JSON.stringify()`.

