import { metadata } from "@shared/metadata"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  return (
    <span className={$([
      "flex p-3 rounded-2xl bg-primary/1 text-sm",
      "shadow shadow-primary/20 hover:shadow-primary/50 transition-shadow-500",
    ])}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "px-2 hover:(bg-primary/10 rounded-md) op-70 dark:op-90",
          "cursor-pointer transition-all",
        )}
      >
        搜索
      </button>
      {Object.entries(metadata).map(([columnId, column]) => (
        <span
          key={columnId}
          className={$(
            "px-2 cursor-pointer transition-all",
            currentId === columnId ? "color-primary font-bold" : "op-70 dark:op-90",
          )}
        >
          {column.name}
        </span>
      ))}
    </span>
  )
}
