import type { PrimitiveAtom } from "jotai"
import type { FixedColumnID, PrimitiveMetadata, SourceID } from "@shared/types"
import type { Update } from "./types"

function createPrimitiveMetadataAtom(
  key: string,
  initialValue: PrimitiveMetadata,
  preprocess: ((stored: PrimitiveMetadata) => PrimitiveMetadata),
): PrimitiveAtom<PrimitiveMetadata> {
  const getInitialValue = (): PrimitiveMetadata => {
    const item = localStorage.getItem(key)
    try {
      if (item) {
        const stored = JSON.parse(item) as PrimitiveMetadata
        verifyPrimitiveMetadata(stored)
        return preprocess({
          ...stored,
          action: "init",
        })
      }
    } catch { }
    return initialValue
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom(get => get(baseAtom), (get, set, update: Update<PrimitiveMetadata>) => {
    const nextValue = update instanceof Function ? update(get(baseAtom)) : update
    if (nextValue.updatedTime > get(baseAtom).updatedTime) {
      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    }
  })
  return derivedAtom
}

const initialMetadata = typeSafeObjectFromEntries(typeSafeObjectEntries(metadata)
  .map(([id, val]) => [id, val.sources] as [FixedColumnID, SourceID[]]))

export function preprocessMetadata(target: PrimitiveMetadata) {
  return {
    data: typeSafeObjectFromEntries(
      typeSafeObjectEntries(target.data).map(([id, userSources]) => {
        // Only add default sources on first run (updatedTime === 0)
        const isFirstRun = target.updatedTime === 0
        const existingValidSources = userSources.filter(k => sources[k]).map(k => sources[k].redirect ?? k)

        if (isFirstRun && existingValidSources.length === 0) {
          // First time user: add default sources
          const defaultSources = initialMetadata[id] || []
          return [id, [...defaultSources]]
        }

        // Return user's saved sources as-is, don't auto-add defaults
        return [id, existingValidSources]
      }),
    ),
    action: target.action,
    updatedTime: target.updatedTime,
  } as PrimitiveMetadata
}

export const primitiveMetadataAtom = createPrimitiveMetadataAtom("metadata", {
  updatedTime: 0,
  data: initialMetadata,
  action: "init",
}, preprocessMetadata)
