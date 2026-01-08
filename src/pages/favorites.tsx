import type { SourceID } from "@shared/types"
import { currentSourcesAtom } from "~/atoms"
import { Dnd } from "~/components/column/dnd"

export function FavoritesPage() {
  const [currentSources, setCurrentSources] = useAtom(currentSourcesAtom)

  const handleDelete = useCallback((id: SourceID) => {
    setCurrentSources(currentSources.filter(source => source !== id))
  }, [currentSources, setCurrentSources])

  return (
    <>
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="text-xl font-bold">我的关注</h2>
        <span className="text-sm op-70">
          已添加
          {currentSources.length}
          {" "}
          个数据源
        </span>
      </div>

      {currentSources.length > 0
        ? (
            <Dnd showDelete onDelete={handleDelete} />
          )
        : (
            <div className="text-center op-70 py-16">
              <p className="text-lg mb-2">还没有关注任何数据源</p>
              <p className="text-sm">前往"更多源"页面添加你感兴趣的数据源</p>
            </div>
          )}
    </>
  )
}
