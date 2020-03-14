import { Method } from "axios";

export interface CacheConfig {
  enable?: boolean;
  dirPath?: string;
  ignoreCacheHttpCodes?: number[];
  ignoreMethods?: Method[];
  maxAge?: number;
}
