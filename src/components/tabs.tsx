export function Tabs({ activeTab, setActiveTab }: {
  activeTab: "config" | "favorites"
  setActiveTab: (tab: "config" | "favorites") => void
}) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-base bg-op-70! backdrop-blur-md rounded-lg p-1">
        <button
          type="button"
          className={$(
            "px-4 py-2 rounded-md transition-all text-sm",
            activeTab === "favorites"
              ? "color-primary bg-primary/10 font-bold"
              : "op-70 hover:op-100",
          )}
          onClick={() => setActiveTab("favorites")}
        >
          我的关注
        </button>
        <button
          type="button"
          className={$(
            "px-4 py-2 rounded-md transition-all text-sm",
            activeTab === "config"
              ? "color-primary bg-primary/10 font-bold"
              : "op-70 hover:op-100",
          )}
          onClick={() => setActiveTab("config")}
        >
          更多源
        </button>
      </div>
    </div>
  )
}
