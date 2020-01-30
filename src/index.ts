import axios, { AxiosAdapter, AxiosRequestConfig } from "axios";
import cookiejar from "axios-cookiejar-support";
import { createHash } from "crypto";
import { mkdirSync } from "fs";
import { CacheInstance } from "./CacheInstance";

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

const cache = new CacheInstance()


export function setupCache(adapterConfig: CacheConfig) {
  const enabled = adapterConfig.enable === undefined ? true : adapterConfig.enable;
  const dir = adapterConfig.dirPath || `./.cache/`;
  mkdirSync(dir, {
    recursive: true
  })

  const axiosCacheAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
    const sha512 = str2Sha512(`${config.url} ${config.method} ${config.responseType}`);
    const cacheDirpath = `${dir}/${sha512}`;

    if (cache.exists(cacheDirpath) && enabled) {
      return cache.load(cacheDirpath)
    } else {
      config.adapter = undefined; // disabled for calling own infinity
      const res = config.transformResponse
      const req = config.transformRequest
      config.transformRequest = undefined
      config.transformResponse = undefined
      const response = await axios.request(config)
      config.transformRequest = req
      config.transformResponse = res

      cache.dump(response, cacheDirpath)

      return response;
    }
  }
  return axiosCacheAdapter;
}

