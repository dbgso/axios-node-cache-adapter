import axios, { AxiosAdapter, AxiosResponse, AxiosRequestConfig } from "axios";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

function str2Sha512(data: string) {
  const hash = createHash('sha512')
  hash.update(data)
  return hash.digest('hex');
}
export interface CacheConfig {
  enable: boolean,
  dirPath: string | undefined
}

export function createConfig(adapterConfig: CacheConfig) {
  const axiosCacheAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
    const sha512 = str2Sha512(`${config.url} ${config.method}`);

    const dir = `./.cache/`;
    mkdirSync(dir, {
      recursive: true
    })
    const cacheFilePath = `${dir}/${sha512}.json`;

    if (existsSync(cacheFilePath) || !adapterConfig.enable) {
      const cachedResponse: AxiosResponse = JSON.parse(readFileSync(cacheFilePath).toString('UTF-8'));
      console.log("[cached]: ", config.url)
      return Promise.resolve(cachedResponse);
    } else {
      config.adapter = undefined; // disabled for calling own infinity

      const response = await axios.request(config)
      writeFileSync(cacheFilePath, JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        config: response.config,
        data: response.data,
        headers: response.headers,
        request: undefined//response.request
      }))
      return response;
    }
  }
  return axiosCacheAdapter;
}

