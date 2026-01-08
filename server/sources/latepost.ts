interface Article {
  title: string
  url: string
  pub_time: string
}

interface Res {
  code: number
  msg: string
  data: {
    list: Article[]
  }
}

export default defineSource(async () => {
  // 晚点早知道API
  const url = "https://www.latepost.com/api/news/know/get_list"
  const res: Res = await myFetch(url)

  if (!res.data?.list) {
    return []
  }

  return res.data.list.map((item) => {
    const id = item.url.split("/").pop() || item.pub_time
    return {
      id,
      title: item.title,
      url: `https://www.latepost.com${item.url}`,
      pubDate: new Date(item.pub_time).valueOf(),
    }
  })
})
