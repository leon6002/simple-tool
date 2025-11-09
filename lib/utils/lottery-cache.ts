import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LotteryResult, SSQResult, KL8Result } from './lottery';

export interface CacheData<T> {
  data: T;
  lastUpdated: number;
  issue: string;
}

export interface LotteryCache {
  ssq: CacheData<SSQResult[]>;
  dlt: CacheData<LotteryResult[]>;
  kl8: CacheData<KL8Result[]>;
}

const DATA_DIR = join(process.cwd(), 'public', 'data', 'lottery');
const SSQ_CACHE_FILE = join(DATA_DIR, 'ssq.json');
const DLT_CACHE_FILE = join(DATA_DIR, 'dlt.json');
const KL8_CACHE_FILE = join(DATA_DIR, 'kl8.json');

// 确保目录存在
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 获取当前时间的北京时区表示
 */
function getBeijingTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
}

/**
 * 检查是否是大乐透开奖时间（每周一、三、五 21:25 开奖）
 * 开奖后直到24点都算需要检查是否有新数据
 */
function isDLTDrawTime(): boolean {
  const beijingTime = getBeijingTime();
  const day = beijingTime.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const hour = beijingTime.getHours();

  // 周一(1)、周三(3)、周五(5)是开奖日
  // 开奖时间21:25，21:30之后我们检查是否有新数据，直到24:00
  return (day === 1 || day === 3 || day === 5) && hour >= 21 && hour < 24;
}

/**
 * 检查是否是双色球开奖时间（每周二、四、日 21:15 开奖）
 * 开奖后直到24点都算需要检查是否有新数据
 */
function isSSQDrawTime(): boolean {
  const beijingTime = getBeijingTime();
  const day = beijingTime.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const hour = beijingTime.getHours();

  // 周二(2)、周四(4)、周日(0)是开奖日
  // 开奖时间21:15，21:20之后我们检查是否有新数据，直到24:00
  return (day === 2 || day === 4 || day === 0) && hour >= 21 && hour < 24;
}

/**
 * 检查是否是快乐8开奖时间（高频彩，每天9:00-23:00，每10分钟一期）
 * 快乐8每天开奖频率很高，我们需要更频繁地检查更新
 */
function isKL8DrawTime(): boolean {
  const beijingTime = getBeijingTime();
  const hour = beijingTime.getHours();
  const minute = beijingTime.getMinutes();

  // 快乐8开奖时间：每天9:00-23:00，每10分钟开奖一期
  // 为了确保数据及时性，我们在开奖时间内每5分钟检查一次
  const isInDrawHours = hour >= 9 && hour < 23;
  const shouldCheck = minute % 5 === 0; // 每5分钟检查一次

  return isInDrawHours && shouldCheck;
}

/**
 * 获取双色球缓存数据
 */
export function getSSQCache(): CacheData<SSQResult[]> | null {
  try {
    if (!existsSync(SSQ_CACHE_FILE)) {
      return null;
    }

    const cacheContent = readFileSync(SSQ_CACHE_FILE, 'utf-8');
    const cacheData: CacheData<SSQResult[]> = JSON.parse(cacheContent);

    // 如果是开奖时间，缓存可能过期，需要检查
    if (isSSQDrawTime()) {
      return null; // 开奖时间，强制重新获取
    }

    // 检查缓存是否过期（24小时）
    const now = Date.now();
    const cacheAge = now - cacheData.lastUpdated;
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    if (cacheAge > maxAge) {
      return null; // 缓存过期
    }

    return cacheData;
  } catch (error) {
    console.error('读取双色球缓存失败:', error);
    return null;
  }
}

/**
 * 获取大乐透缓存数据
 */
export function getDLTCache(): CacheData<LotteryResult[]> | null {
  try {
    if (!existsSync(DLT_CACHE_FILE)) {
      return null;
    }

    const cacheContent = readFileSync(DLT_CACHE_FILE, 'utf-8');
    const cacheData: CacheData<LotteryResult[]> = JSON.parse(cacheContent);

    // 如果是开奖时间，缓存可能过期，需要检查
    if (isDLTDrawTime()) {
      return null; // 开奖时间，强制重新获取
    }

    // 检查缓存是否过期（24小时）
    const now = Date.now();
    const cacheAge = now - cacheData.lastUpdated;
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    if (cacheAge > maxAge) {
      return null; // 缓存过期
    }

    return cacheData;
  } catch (error) {
    console.error('读取大乐透缓存失败:', error);
    return null;
  }
}

/**
 * 保存双色球缓存数据
 */
export function saveSSQCache(data: SSQResult[]): void {
  try {
    ensureDataDir();

    // 获取最新一期数据
    const latestResult = data[0];
    const cacheData: CacheData<SSQResult[]> = {
      data,
      lastUpdated: Date.now(),
      issue: latestResult?.issue || ''
    };

    writeFileSync(SSQ_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
    console.log('双色球数据已缓存到:', SSQ_CACHE_FILE);
  } catch (error) {
    console.error('保存双色球缓存失败:', error);
  }
}

/**
 * 保存大乐透缓存数据
 */
export function saveDLTCache(data: LotteryResult[]): void {
  try {
    ensureDataDir();

    // 获取最新一期数据
    const latestResult = data[0];
    const cacheData: CacheData<LotteryResult[]> = {
      data,
      lastUpdated: Date.now(),
      issue: latestResult?.issue || ''
    };

    writeFileSync(DLT_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
    console.log('大乐透数据已缓存到:', DLT_CACHE_FILE);
  } catch (error) {
    console.error('保存大乐透缓存失败:', error);
  }
}

/**
 * 检查是否需要刷新双色球数据
 */
export function shouldRefreshSSQ(currentIssue: string): boolean {
  const cache = getSSQCache();
  if (!cache) return true;

  // 如果期号不同，说明有新数据
  return cache.issue !== currentIssue;
}

/**
 * 检查是否需要刷新大乐透数据
 */
export function shouldRefreshDLT(currentIssue: string): boolean {
  const cache = getDLTCache();
  if (!cache) return true;

  // 如果期号不同，说明有新数据
  return cache.issue !== currentIssue;
}

/**
 * 获取快乐8缓存数据
 */
export function getKL8Cache(): CacheData<KL8Result[]> | null {
  try {
    if (!existsSync(KL8_CACHE_FILE)) {
      return null;
    }

    const cacheContent = readFileSync(KL8_CACHE_FILE, 'utf-8');
    const cacheData: CacheData<KL8Result[]> = JSON.parse(cacheContent);

    // 快乐8是高频彩，需要更频繁的检查
    if (isKL8DrawTime()) {
      return null; // 开奖时间，强制重新获取
    }

    // 检查缓存是否过期（快乐8使用较短的缓存时间：30分钟）
    const now = Date.now();
    const cacheAge = now - cacheData.lastUpdated;
    const maxAge = 30 * 60 * 1000; // 30分钟

    if (cacheAge > maxAge) {
      return null; // 缓存过期
    }

    return cacheData;
  } catch (error) {
    console.error('读取快乐8缓存失败:', error);
    return null;
  }
}

/**
 * 保存快乐8缓存数据
 */
export function saveKL8Cache(data: KL8Result[]): void {
  try {
    ensureDataDir();

    // 获取最新一期数据
    const latestResult = data[0];
    const cacheData: CacheData<KL8Result[]> = {
      data,
      lastUpdated: Date.now(),
      issue: latestResult?.issue || ''
    };

    writeFileSync(KL8_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
    console.log('快乐8数据已缓存到:', KL8_CACHE_FILE);
  } catch (error) {
    console.error('保存快乐8缓存失败:', error);
  }
}

/**
 * 检查是否需要刷新快乐8数据
 */
export function shouldRefreshKL8(currentIssue: string): boolean {
  const cache = getKL8Cache();
  if (!cache) return true;

  // 如果期号不同，说明有新数据
  return cache.issue !== currentIssue;
}