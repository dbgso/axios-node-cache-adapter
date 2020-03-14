export interface CacheConfig {
  enable?: boolean;
  dirPath?: string;
  ignoreCacheHttpCodes?: number[]; // not implemented,
  maxAge?: number;
}
