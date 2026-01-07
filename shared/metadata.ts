import { sources } from "./sources"
import { typeSafeObjectEntries } from "./type.util"
import type { Metadata } from "./types"

// Simplified metadata - only show all sources
export const metadata: Metadata = {
  all: {
    name: "全部",
    sources: typeSafeObjectEntries(sources)
      .filter(([, v]) => !v.redirect)
      .map(([k]) => k),
  },
}

export const fixedColumnIds = ["all"] as const
export const hiddenColumns = [] as const
