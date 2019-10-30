import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

function str2Sha512(data: string) {
  const hash = createHash('sha512')
  hash.update(data)
  return hash.digest('hex');
}
export interface CacheConfig {
  enable?: boolean,
  dirPath?: string,
  ignoreCacheHttpCodes?: number[]
}

interface Cacher {
  encode(data: any): any
  decode(data: any): Buffer
}

class NullCahcer implements Cacher {
  encode(data: any) {
    return data;
  }
  decode(data: any): Buffer {
    return data;
  }
}

class ArrayBufferCacher implements Cacher{
  encode(data: any) {
    throw new Error("Method not implemented.");
  }
  
  decode(data: any) {
    return new Buffer(data)
  }
}

const cachers: Map<string|undefined, Cacher> = new Map()
cachers.set("text", new NullCahcer())
cachers.set("arraybuffer", new ArrayBufferCacher())

class CacheInstance {

  constructor() {
  }
  exists(path: string) {
    return existsSync(path)
  }
  dump(response: AxiosResponse, path: string) {
    if (!existsSync(path))
      mkdirSync(path)
    writeFileSync(`${path}/status`, JSON.stringify(response.status))
    writeFileSync(`${path}/statusText`, JSON.stringify(response.statusText))
    writeFileSync(`${path}/config`, JSON.stringify(response.config))
    writeFileSync(`${path}/data`, response.data)
    writeFileSync(`${path}/headers`, JSON.stringify(response.headers))
    writeFileSync(`${path}/request`, JSON.stringify(response.request))
  }
  load(path: string): AxiosResponse {
    return {
      status: parseInt(readFileSync(`${path}/status`).toString()),
      config: JSON.parse(readFileSync(`${path}/config`).toString()),
      data: readFileSync(`${path}/data`),
      headers: JSON.parse(readFileSync(`${path}/headers`).toString()),
      request: undefined,
      statusText: readFileSync(`${path}/statusText`).toString()
    }
    

    const a = readFileSync("").toJSON()
    
    
    
    readFileSync(`${path}/request`)
    
  }
}

const c = new CacheInstance()
 

export function createConfig(adapterConfig: CacheConfig) {
  const axiosCacheAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
    const cacher = cachers.get(config.responseType) || new NullCahcer();
    // const cacher = new ArrayBufferCacher();

    const sha512 = str2Sha512(`${config.url} ${config.method}`);

    const enabled = adapterConfig.enable === undefined ? true : adapterConfig.enable;
    const dir = adapterConfig.dirPath || `./.cache/`;
    mkdirSync(dir, {
      recursive: true
    })
    const cacheFilePath = `${dir}/${sha512}.json`;
    const dd = `${dir}/${sha512}`;

    if (c.exists(dd)) {
      // writeFileSync("data", c.load(dd).data)
      return c.load(dd).data
    }
    if (existsSync(cacheFilePath) && enabled) {
      const cachedResponse: AxiosResponse = JSON.parse(readFileSync(cacheFilePath).toString('UTF-8'));
      
      // cachedResponse.data = cacher.decode(cachedResponse.data)
      console.log("[cached]: ", config.url)
      return Promise.resolve(cachedResponse);
    } else {
      config.adapter = undefined; // disabled for calling own infinity
      const res = config.transformResponse
      const req = config.transformRequest
      config.transformRequest = undefined
      config.transformResponse = undefined
      const response = await axios.request(config)
      config.transformRequest = req
      config.transformResponse = res

      writeFileSync(cacheFilePath, JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        config: response.config,
        data: response.data,
        headers: response.headers,
        request: undefined//response.request
      }))
      c.dump(response, dd)

      console.log("hoge", response)
      return response;
    }
  }
  return axiosCacheAdapter;
}

