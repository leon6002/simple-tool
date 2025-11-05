import * as cheerio from "cheerio";

/**
 * 定义单注彩票的数据结构
 */
export interface LotteryEntry {
  numbers: number[];
  specialNumbers: number[];
}

/**
 * 定义解析结果的整体结构
 */
export interface ParseResult {
  type: string | null;
  issueNumber: string | null; // 期数
  drawDate: string | null; // 开奖日期
  totalCost: number | null; // 合计金额
  entries: LotteryEntry[]; // 包含多注号码的数组
}

/**
 * 定义单条开奖结果的数据结构
 */
export interface LotteryResult {
  issue: string; // 期号
  numbers: string[]; // 常规号码 (红球)
  specialNumbers: string[]; // 特殊号码 (蓝球)
}

/**
 * 爬取新浪彩票的大乐透最近开奖数据
 * @returns Promise<LotteryResult[]>
 */
export async function fetchLatestDLTData(): Promise<LotteryResult[]> {
  // 目标 URL (综合走势图，默认为最近50期)
  const url =
    "https://view.lottery.sina.com.cn/lotto/pc_zst/index?lottoType=dlt&actionType=chzs";

  try {
    // 1. 发起 HTTP 请求
    const response = await fetch(url, {
      headers: {
        // 模拟浏览器 User-Agent，防止基础的反爬
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching page: ${response.status} ${response.statusText}`
      );
      return [];
    }

    // 2. 获取 HTML 文本
    const html = await response.text();

    // 3. 使用 Cheerio 加载 HTML
    const $ = cheerio.load(html);

    const results: LotteryResult[] = [];

    // 4. 定位到数据表格的主体 (根据 test.html)
    $("#cpdata tr").each((index, element) => {
      const row = $(element);

      // 5. 提取期号
      // 每一行的第一个 <td> 就是期号
      const issue = row.find("td").first().text().trim();

      // 如果没有期号，说明是无效行 (例如表头或分隔行)，跳过
      if (!issue) {
        return;
      }

      // 6. 提取常规号码 (红球)
      //  class 为 'chartball01' 的 <td>
      const numbers: string[] = [];
      row.find(".chartball01").each((i, numEl) => {
        numbers.push($(numEl).text().trim());
      });

      // 7. 提取特殊号码 (蓝球)
      // class 为 'chartball02' 的 <td>
      const specialNumbers: string[] = [];
      row.find(".chartball02").each((i, numEl) => {
        specialNumbers.push($(numEl).text().trim());
      });

      // 8. 组装数据 (确保所有数据都存在)
      if (issue && numbers.length > 0 && specialNumbers.length > 0) {
        // 大乐透是 5+2 (前区1-35，后区1-12)
        // .chartball01 标识前区号码，.chartball02 标识后区号码
        // 为了确保数据准确，我们进行范围过滤
        const finalNumbers = numbers.filter((n) => {
          const num = parseInt(n, 10);
          return num >= 1 && num <= 35;
        });
        const finalSpecialNumbers = specialNumbers.filter((n) => {
          const num = parseInt(n, 10);
          return num >= 1 && num <= 12;
        });

        // 只有当前区有5个号码且后区有2个号码时才添加
        if (finalNumbers.length === 5 && finalSpecialNumbers.length === 2) {
          results.push({
            issue,
            numbers: finalNumbers,
            specialNumbers: finalSpecialNumbers,
          });
        }
      }
    });

    // 网页上数据是旧的在上面，新的在下面，所以最后一条是最新
    return results;
  } catch (error) {
    console.error("爬取失败:", error);
    return [];
  }
}
