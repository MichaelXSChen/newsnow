import type { SourceID } from "@shared/types"
import { sources } from "@shared/sources"
import { useMemo } from "react"
import pinyin from "@shared/pinyin.json"
import { currentSourcesAtom } from "~/atoms"

export function ConfigPage() {
  const [currentSources, setCurrentSources] = useAtom(currentSourcesAtom)

  // 获取所有可用的源（排除重定向和已添加的）
  const availableSources = useMemo(() => {
    return Object.entries(sources)
      .filter(([id, source]) => !source.redirect && !currentSources.includes(id as SourceID))
      .map(([id, source]) => ({
        id: id as SourceID,
        name: source.name,
        title: source.title,
        pinyin: pinyin?.[id as keyof typeof pinyin] ?? "",
        color: source.color,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
  }, [currentSources])

  const addSource = useCallback((id: SourceID) => {
    setCurrentSources([...currentSources, id])
  }, [currentSources, setCurrentSources])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">更多源</h2>
      <p className="text-sm op-70 mb-4">点击添加按钮将数据源添加到你的关注中</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableSources.map(source => (
          <div
            key={source.id}
            className={$([
              "flex items-center justify-between p-3 rounded-lg",
              "bg-base bg-op-70! backdrop-blur-md",
              "hover:bg-primary/5 transition-all",
            ])}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={$("w-8 h-8 rounded-md bg-cover flex-shrink-0", `sprinkle-${source.color}`)}
                style={{
                  backgroundImage: `url(/icons/${source.id.split("-")[0]}.png)`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{source.name}</div>
                {source.title && (
                  <div className={$("text-xs", `color-${source.color} bg-op-50! px-1 rounded inline-block mt-0.5`)}>
                    {source.title}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn i-ph:plus-circle-duotone text-lg flex-shrink-0"
              onClick={() => addSource(source.id)}
              title="添加到收藏"
            />
          </div>
        ))}
      </div>

      {availableSources.length === 0 && (
        <div className="text-center op-70 py-8">
          <p>所有数据源都已添加到关注中</p>
        </div>
      )}
    </div>
  )
}
