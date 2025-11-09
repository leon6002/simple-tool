import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fetchLatestDLTData, fetchLatestSSQData, fetchLatestKL8Data } from './lottery';

const DATA_DIR = join(process.cwd(), 'public', 'data', 'lottery');
const SSQ_CACHE_FILE = join(DATA_DIR, 'ssq.json');
const DLT_CACHE_FILE = join(DATA_DIR, 'dlt.json');
const KL8_CACHE_FILE = join(DATA_DIR, 'kl8.json');

/**
 * 清理双色球缓存
 */
export function clearSSQCache(): boolean {
  try {
    if (existsSync(SSQ_CACHE_FILE)) {
      unlinkSync(SSQ_CACHE_FILE);
      console.log('双色球缓存已清理');
      return true;
    }
    return false;
  } catch (error) {
    console.error('清理双色球缓存失败:', error);
    return false;
  }
}

/**
 * 清理大乐透缓存
 */
export function clearDLTCache(): boolean {
  try {
    if (existsSync(DLT_CACHE_FILE)) {
      unlinkSync(DLT_CACHE_FILE);
      console.log('大乐透缓存已清理');
      return true;
    }
    return false;
  } catch (error) {
    console.error('清理大乐透缓存失败:', error);
    return false;
  }
}

/**
 * 清理快乐8缓存
 */
export function clearKL8Cache(): boolean {
  try {
    if (existsSync(KL8_CACHE_FILE)) {
      unlinkSync(KL8_CACHE_FILE);
      console.log('快乐8缓存已清理');
      return true;
    }
    return false;
  } catch (error) {
    console.error('清理快乐8缓存失败:', error);
    return false;
  }
}

/**
 * 清理所有彩票缓存
 */
export function clearAllLotteryCache(): void {
  clearSSQCache();
  clearDLTCache();
  clearKL8Cache();
}

/**
 * 强制刷新双色球数据（清除缓存后重新获取）
 */
export async function forceRefreshSSQ() {
  clearSSQCache();
  return await fetchLatestSSQData();
}

/**
 * 强制刷新大乐透数据（清除缓存后重新获取）
 */
export async function forceRefreshDLT() {
  clearDLTCache();
  return await fetchLatestDLTData();
}

/**
 * 强制刷新快乐8数据（清除缓存后重新获取）
 */
export async function forceRefreshKL8() {
  clearKL8Cache();
  return await fetchLatestKL8Data();
}

/**
 * 强制刷新所有彩票数据
 */
export async function forceRefreshAll() {
  const [ssqData, dltData, kl8Data] = await Promise.all([
    forceRefreshSSQ(),
    forceRefreshDLT(),
    forceRefreshKL8()
  ]);

  return {
    ssq: ssqData,
    dlt: dltData,
    kl8: kl8Data
  };
}