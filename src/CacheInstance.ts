import { AxiosResponse } from "axios";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
export class CacheInstance {
  constructor() {
  }
  exists(path: string) {
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
