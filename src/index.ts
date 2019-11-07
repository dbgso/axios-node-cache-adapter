import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import cookiejar from "axios-cookiejar-support";

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

// for cookie support
cookiejar(axios)

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
    writeFileSync(`${path}/request`, undefined)
  }
  private loadWithResponseType(response: AxiosResponse, path: string) {
    if (response.config.responseType === 'arraybuffer')
      return readFileSync(path)
    return readFileSync(path).toString();
  }
  load(path: string): AxiosResponse {
    const response: AxiosResponse = {
      status: parseInt(readFileSync(`${path}/status`).toString()),
      config: JSON.parse(readFileSync(`${path}/config`).toString()),
      data: undefined,
      headers: JSON.parse(readFileSync(`${path}/headers`).toString()),
      request: undefined,
      statusText: readFileSync(`${path}/statusText`).toString()
    };
    response.data = this.loadWithResponseType(response, `${path}/data`)
    return response
  }
}

const c = new CacheInstance()


export function createConfig(adapterConfig: CacheConfig) {
  const axiosCacheAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
    const sha512 = str2Sha512(`${config.url} ${config.method} ${config.responseType}`);

    const enabled = adapterConfig.enable === undefined ? true : adapterConfig.enable;
    const dir = adapterConfig.dirPath || `./.cache/`;
    mkdirSync(dir, {
      recursive: true
    })
    const cacheFilePath = `${dir}/${sha512}.json`;
    const dd = `${dir}/${sha512}`;

    if (c.exists(dd) && enabled) {
      console.log("[cached]: ", config.url)
      return c.load(dd)
    } else {
      config.adapter = undefined; // disabled for calling own infinity
      const res = config.transformResponse
      const req = config.transformRequest
      config.transformRequest = undefined
      config.transformResponse = undefined
      const response = await axios.request(config)
      config.transformRequest = req
      config.transformResponse = res

      c.dump(response, cacheDirpath)

      return response;
    }
  }
  return axiosCacheAdapter;
}

