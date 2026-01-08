import * as cheerio from "cheerio"

export default defineSource(async () => {
  const html = await myFetch("https://www.latepost.com/")
  const $ = cheerio.load(html)
  const news: any[] = []

  // 解析"晚点早知道"栏目
  $(".Newsletter-li").each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a")
    const title = $a.find(".Newsletter-li-title").text()
    const href = $a.attr("href")
    const dateStr = $el.find(".Newsletter-li-date").text().trim()

    if (title && href) {
      // 从日期字符串解析，格式如 "02月19日"
      const dateMatch = dateStr.match(/(\d{2})月(\d{2})日/)
      let pubDate
      if (dateMatch) {
        // 使用当前年份
        const currentYear = new Date().getFullYear()
        pubDate = new Date(`${currentYear}-${dateMatch[1]}-${dateMatch[2]}`).valueOf()
      }

      news.push({
        id: href,
        title,
        url: `https://www.latepost.com${href}`,
        pubDate: pubDate || Date.now(),
      })
    }
  })

  // 如果没有找到"早知道"，尝试解析"往期早知道"
  if (news.length === 0) {
    $(".oldNewsletter-list li").each((_, el) => {
      const $el = $(el)
      const $a = $el.find("a")
      const title = $a.text().trim()
      const href = $a.attr("href")
      const dateStr = $el.find(".date").text().trim()

      if (title && href) {
        // 解析日期，格式如 "02月\n19日"
        const month = dateStr.match(/(\d{2})月/)?.[1]
        const day = dateStr.match(/(\d{2})日/)?.[1]

        let pubDate
        if (month && day) {
          const currentYear = new Date().getFullYear()
          pubDate = new Date(`${currentYear}-${month}-${day}`).valueOf()
        }

        news.push({
          id: href,
          title,
          url: `https://www.latepost.com${href}`,
          pubDate: pubDate || Date.now(),
        })
      }
    })
  }

  return news
})
