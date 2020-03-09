# axios-node-cache-adapter

* Axios cache adapter for Node.js
* Created for avoiding useless request to servers.
* Inspired by scrapy.

# Usage

```
$ yarn add @dbgso/axios-node-cache-adapter
// or
$ npm install @dbgso/axios-node-cache-adapter
```

```typescript
import axiso from "axios";
import { setupCache } from "axios-node-cache-adapter";
async function main() {
    const io = axiso.create({
        adapter: setupCache({
            enable: true
        }),
    })
    console.time('first')
    const first = await io.get('https://www.example.com');
    console.timeEnd('first')

    console.time('second')
    const second = await io.get('https://www.example.com');    
    console.timeEnd('second')
    
    console.time('third')
    const third = await io.get('https://www.example.com');    
    console.timeEnd('third')
    

    console.log(first.data === second.data);
    
}
main();
```

result

```bash
first: 537.650ms
second: 3.383ms
second: 1.678ms
true
```