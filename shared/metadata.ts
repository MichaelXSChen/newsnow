import type { Metadata } from "./types"

// Simplified metadata - only show all sources
export const metadata: Metadata = {
  all: {
    name: "全部",
    sources: [
      // 中文热门
      "zhihu",
      "weibo",
      "douyin",
      "ithome",
      "thepaper",
      // 科技
      "v2ex-share",
      "hackernews",
      "github-trending-today",
      // 财经
      "wallstreetcn-quick",
      "cls-telegraph",
      "xueqiu-hotstock",
    ],
  },
}

export const fixedColumnIds = ["all"] as const
export const hiddenColumns = [] as const
