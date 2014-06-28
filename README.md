# vhosts

A cli based vhosts server for express/connect apps

### install
```
	npm install -g vhosts
```

### quick start
```
> vhosts start

Daemon started with pid: 99999

> vhosts status

Daemon is running

> vhosts add www.mydomain.com /path/to/app.js

adding www.mydomain.com, /Users/kessler/dev/nodejs/vhosts/test/work/app.js

> vhosts remove www.mydomain.com

removing www.mydomain.com

> vhosts stop

Daemon was stopped
```
### features:
```
  vhosts service can
    ✓ stop (stop command) 
    ✓ start (start command)
    ✓ report status (status command)
    ✓ service different vhosts
    - lists vhosts
    add vhosts on the fly
      ✓ via file creation in cache directory
      ✓ via add command
    remove hosts on the fly
      ✓ via file deletion
      ✓ via remove command
    add wildcard hosts
      ✓ for windows os - a file with _ to represent *
      ✓ for windows os - a file _ to represent *
      ✓ via add command
```
### debug

linux/osx
```
	export DEBUG=vhosts*
```
windows
```
	set DEBUG=vhosts*
```

### Alternatives

[express-fast-vhosts](https://www.npmjs.org/package/express-fast-vhosts)

[vhostess](https://www.npmjs.org/package/vhostess)
