import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { cors } from "hono/cors";
import * as cheerio from "cheerio";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", poweredBy());
app.use("*", cors());
app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ping", (c) => {
  return c.text("pong");
});

app.get("/nrta", async (c) => {
  const url = "https://www.nrta.gov.cn/col/col38/index.html";

  const headers = {
    "accept-language": "en-US,en;q=0.6",
    "Referer": "https://www.nrta.gov.cn/col/col38/index.html",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 uacq",
  };

  const body =
    "col=1&webid=1&path=http%3A%2F%2Fwww.nrta.gov.cn%2F&columnid=38&sourceContentType=1&unitid=14416&webname=%E5%9B%BD%E5%AE%B6%E5%B9%BF%E6%92%AD%E7%94%B5%E8%A7%86%E6%80%BB%E5%B1%80&permissiontype=0%0A";

  const response = await fetch(url, {
    headers: headers,
    cf: {
      cacheTtlByStatus: { "200-299": 86400, "4xx": 1, "5xx": 0 },
    },
  });

  // 确保请求成功
  if (!response.ok) {
    return new Response("Failed to fetch the Data", {
      status: response.status,
    });
  }

  // 获取HTML文本
  const htmlText = await response.text();

  const $ = cheerio.load(htmlText, {
    xmlMode: true,
  });

  const records = [];

  $("recordset record").each((index, element) => {
    const $record = $(element);

    // Extract link, title, and date from CDATA
    const cdataContent = $record.text();

    // 从每个记录中提取数据
    const link = $(cdataContent).find("a").attr("href");
    const date = $(cdataContent).find("span").text();
    const title = $(cdataContent).find("a").text().replace(date, "").trim();

    const record = {
      title,
      link,
      date,
    };

    if (title.includes("发行许可")) {
      records.push(record);
    }
  });

  return c.json(records);
});

app.get("/gallerix", async (c) => {
  const url = "https://gallerix.asia/a1/";

  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.8",
    "upgrade-insecure-requests": "1",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 uacq",
  };

  const response = await fetch(url, {
    headers: headers,
    cf: {
      cacheTtlByStatus: { "200-299": 86400, "4xx": 1, "5xx": 0 },
    },
  });

  // 确保请求成功
  if (!response.ok) {
    return new Response("Failed to fetch the Data", {
      status: response.status,
    });
  }

  const htmlText = await response.text();

  const $ = cheerio.load(htmlText);

  const records = [];

  $(".pic").each((index, element) => {
    const $record = $(element);

    const imageSrc = $record.find("img").attr("src");
    const imageUrl = imageSrc.startsWith("//") ? "https:" + imageSrc : imageSrc;

    // Get the artist's name and the number of images
    // Note that the artist's name is in the 'alt' attribute of the image, and the number is bolded just before the <br> tag
    const artistName = $record.find("img").attr("alt");
    const numberOfImages = parseInt(
      $record
        .find("b")
        .first()
        .text()
        .replace(/[^0-9]/g, ""),
    ); // Remove all non-digit characters

    const record = {
      imageUrl,
      artistName,
      numberOfImages,
    };

    records.push(record);
  });

  return c.json(records);
});

// Custom Not Found Message
app.notFound((c) => {
  return c.text("404 Not Found", 404);
});

// Error handling
app.onError((err, c) => {
  console.log(`${err}`);
  return c.text("Custom Error Message", 500);
});

export default app;
