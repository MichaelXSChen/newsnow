import { Command } from "cmdk"
import { useMount } from "react-use"
import type { SourceID } from "@shared/types"
import { useMemo, useRef, useState } from "react"
import pinyin from "@shared/pinyin.json"
import { OverlayScrollbar } from "../overlay-scrollbar"
import { CardWrapper } from "~/components/column/card"

import "./cmdk.css"

interface SourceItemProps {
  id: SourceID
  name: string
  title?: string
  pinyin: string
}

export function SearchBar() {
  const { opened, toggle } = useSearchBar()
  const sourceItems = useMemo(
    () =>
      typeSafeObjectEntries(sources)
        .filter(([_, source]) => !source.redirect)
        .map(([k, source]) => ({
          id: k,
          title: source.title,
          name: source.name,
          pinyin: pinyin?.[k as keyof typeof pinyin] ?? "",
        }))
    , [],
  )
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [value, setValue] = useState<SourceID>("github-trending-today")

  useMount(() => {
    inputRef?.current?.focus()
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", keydown)
    return () => {
      document.removeEventListener("keydown", keydown)
    }
  })

  return (
    <Command.Dialog
      open={opened}
      onOpenChange={toggle}
      value={value}
      onValueChange={(v) => {
        if (v in sources) {
          setValue(v as SourceID)
        }
      }}
    >
      <Command.Input
        ref={inputRef}
        autoFocus
        placeholder="搜索你想要的"
      />
      <div className="md:flex pt-2">
        <OverlayScrollbar defer className="overflow-y-auto md:min-w-275px">
          <Command.List>
            <Command.Empty>没有找到，可以前往 Github 提 issue</Command.Empty>
            {
              sourceItems.map(item => <SourceItem item={item} key={item.id} />)
            }
          </Command.List>
        </OverlayScrollbar>
        <div className="flex-1 pt-2 px-4 min-w-350px max-md:hidden">
          <CardWrapper id={value} />
        </div>
      </div>
    </Command.Dialog>
  )
}

function SourceItem({ item }: {
  item: SourceItemProps
}) {
  return (
    <Command.Item
      keywords={[item.name, item.title ?? "", item.pinyin]}
      value={item.id}
      className="flex items-center p-2"
    >
      <span className="flex gap-2 items-center">
        <span
          className={$("w-4 h-4 rounded-md bg-cover")}
          style={{
            backgroundImage: `url(/icons/${item.id.split("-")[0]}.png)`,
          }}
        />
        <span>{item.name}</span>
        <span className="text-xs text-neutral-400/80 self-end mb-3px">{item.title}</span>
      </span>
    </Command.Item>
  )
}
