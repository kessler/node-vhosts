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
    ✓ stop (stop command) (2266ms)
    ✓ start (start command) (2217ms)
    ✓ report status (status command) (4403ms)
    ✓ service different vhosts (www.638fae4a-767e-47cc-a646-aab31bd9117b.com) (2335ms)
    - lists vhosts
    add vhosts on the fly
      ✓ via file creation in cache directory (www.fbb51a09-2652-4eb4-8b8b-c59b1c9432d1.com) (2890ms)
      ✓ via add command (www.08490643-0407-4792-90be-35209a6b8180.com) (4089ms)
    remove hosts on the fly
      ✓ via file deletion (2797ms)
      ✓ via remove command (3846ms)
    add wildcard hosts
      ✓ for windows os - a file with _ to represent * (_.4fe74d58-dc76-42a1-84c7-c3a2884f4eed.com) (3091ms)
      ✓ for windows os - a file _ to represent * (a_.c3b13b0f-5c74-4d45-9a04-d0c4b296b0e8.com) (2994ms)
      ✓ via add command (*.6d521702-5705-492a-aded-dcea4f6e8dc7.com) (4046ms)
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
