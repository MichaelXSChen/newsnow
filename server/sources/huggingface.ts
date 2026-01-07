import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  try {
    // 使用 HuggingFace 镜像站获取每日论文
    // huggingface.co 在国内被墙，使用 hf-mirror.com 作为镜像
    const url = "https://hf-mirror.com/api/daily_papers?limit=20"
    const response = await myFetch<PaperResponse[]>(url)

    if (!response || !Array.isArray(response)) {
      return []
    }

    const items: NewsItem[] = response.map((item) => {
      const paper = item.paper
      // 构建作者列表
      const authors = paper.authors.map(a => a.name).join(", ")
      // 构建摘要
      const summary = paper.summary || paper.ai_summary || ""

      return {
        id: `huggingface-${paper.id}`,
        title: paper.title,
        url: `https://huggingface.co/papers/${paper.id}`,
        summary: `${authors}\n\n${summary}`,
        timestamp: new Date(paper.publishedAt).getTime(),
        extra: {
          upvotes: paper.upvotes,
          comments: item.numComments,
          arxivId: paper.id,
          thumbnail: item.thumbnail,
        },
      }
    })

    return items
  } catch (error: any) {
    console.error("Failed to fetch Hugging Face papers:", error.message)
    return []
  }
})

interface PaperResponse {
  paper: {
    id: string
    title: string
    summary: string
    ai_summary?: string
    authors: Array<{ name: string }>
    publishedAt: string
    upvotes: number
  }
  numComments: number
  thumbnail?: string
}
