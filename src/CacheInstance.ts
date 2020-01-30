import { AxiosResponse } from "axios";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
interface CacheOptions {
  maxAge: number;
};
interface CachedOption {
  timestamp: number;
}
export class CacheInstance {
  constructor(private option: CacheOptions) {
  }
  exists(path: string): boolean {

    const p = `${path}/options`;
    if (!existsSync(p)) return false;

    const sync = readFileSync(p);

    const now = new Date();
    const options = JSON.parse(sync.toString()) as CachedOption;
    const d = new Date(options.timestamp);
    d.getTime();
    const delta = now.getTime() - d.getTime()
    if (delta > this.option.maxAge) {
      return false;
    }
    return existsSync(path);
  }
  dump(response: AxiosResponse, path: string) {
    if (!existsSync(path))
      mkdirSync(path);
    writeFileSync(`${path}/status`, JSON.stringify(response.status));
    writeFileSync(`${path}/statusText`, JSON.stringify(response.statusText));
    writeFileSync(`${path}/config`, JSON.stringify(response.config));
    writeFileSync(`${path}/data`, response.data);
    writeFileSync(`${path}/headers`, JSON.stringify(response.headers));
    writeFileSync(`${path}/request`, undefined);
    writeFileSync(`${path}/options`, JSON.stringify({
      timestamp: new Date().getTime(),
    }));
  }
  private loadWithResponseType(response: AxiosResponse, path: string) {
    if (response.config.responseType === 'arraybuffer')
      return readFileSync(path);
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
    response.data = this.loadWithResponseType(response, `${path}/data`);
    return response;
  }
}
