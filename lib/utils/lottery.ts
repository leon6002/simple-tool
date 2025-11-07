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

const crawlWeb = async (url: string) => {
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
    return "";
  }

  // 2. 获取 HTML 文本
  const html = await response.text();
  return html;
};

const parseDLT = (html: string) => {
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
    row.find("td.chartball01, td.chartball20").each((i, numEl) => {
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
};

/**
 * 爬取新浪彩票的大乐透最近开奖数据
 * @returns Promise<LotteryResult[]>
 */
export async function fetchLatestDLTData(): Promise<LotteryResult[]> {
  // 新浪彩票 (综合走势图，默认为最近50期)
  const url =
    "https://view.lottery.sina.com.cn/lotto/pc_zst/index?lottoType=dlt&actionType=chzs";
  try {
    const html = await crawlWeb(url);
    return parseDLT(html);
  } catch (error) {
    console.error("爬取失败:", error);
    return [];
  }
}

export interface SSQResult {
  /** 期号 (e.g., "2025127") */
  issue: string;
  /** 红球数组 (e.g., ["03", "09", "15", "17", "19", "28"]) */
  redBalls: string[];
  /** 蓝球 (e.g., "03") */
  blueBall: string;
  /** 和值 (e.g., "91") */
  sum: string;
  /** 奇偶比 (e.g., "5:1") */
  oddEvenRatio: string;
}

/**
 * 使用 Cheerio 解析新浪双色球HTML内容，提取开奖结果。
 * @param htmlContent 包含开奖数据的 HTML 字符串。
 * @returns SSQResult 数组。
 */
const parseSSQResults = (htmlContent: string): SSQResult[] => {
  const results: SSQResult[] = [];

  // 1. 加载 HTML 字符串到 Cheerio
  const $ = cheerio.load(htmlContent);

  // 2. 根据 ssqhtml 文件内容，数据表格的主体 ID 为 "cpdata" [cite: 206]
  //    我们直接选取 "cpdata" 主体中的所有数据行 (<tr>)
  const rows = $("#cpdata tr");
  console.log("rows:", rows.length);

  // 3. 遍历每一行来提取数据
  rows.each((index, element) => {
    try {
      const row = $(element); // 将当前 DOM 元素包装成 Cheerio 对象

      // 提取期号 (每行的第一个 <td>)
      const issue = row.find("td:first-child").text().trim();

      // 提取红球 (所有 class 为 'chartball01' 的 <td>) [cite: 207]
      const redBalls: string[] = row
        .find("td.chartball01, td.chartball20")
        .map((i, el) => $(el).text().trim()) // 遍历所有红球元素，提取文本
        .get(); // 转换为 string[] 数组

      // 提取蓝球 (class 为 'chartball02' 的 <td>) [cite: 207]
      const blueBall = row.find("td.chartball02").text().trim();

      // 提取和值 (倒数第 4 个 <td>)
      const sum = row.find("td:nth-last-child(4)").text().trim();

      // 提取奇偶比 (最后一个 <td> 里的 <div>) [cite: 207]
      const oddEvenRatio = row.find("td:last-child div").text().trim();

      // 4. 验证数据完整性后，推入结果数组
      if (issue && redBalls.length === 6 && blueBall) {
        console.log("issue:", issue);
        results.push({
          issue,
          redBalls,
          blueBall,
          sum,
          oddEvenRatio,
        });
      }
      // 注：cheerio 会自动遍历到 <tbody id="cp-presele"> 等后续行 [cite: 235]，
      // 但由于它们的结构不同，不满足上面的 if 条件，会自动被跳过，
      // 从而避免了解析到 "预选行" 等无关数据。
    } catch (error) {
      console.error("解析某行数据时出错:", error);
    }
  });

  return results;
};

export const fetchLatestSSQData = async (): Promise<SSQResult[]> => {
  const url =
    "https://view.lottery.sina.com.cn/lotto/pc_zst/index?lottoType=ssq&actionType=chzs&dpc=1";
  try {
    const html = await crawlWeb(url);
    return parseSSQResults(html);
  } catch (error) {
    console.error("爬取失败:", error);
    return [];
  }
};
