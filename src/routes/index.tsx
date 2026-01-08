import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Tabs } from "~/components/tabs"
import { ConfigPage } from "~/pages/config"
import { FavoritesPage } from "~/pages/favorites"

export const Route = createFileRoute("/")({
  component: IndexComponent,
})

function IndexComponent() {
  const [activeTab, setActiveTab] = useState<"config" | "favorites">("favorites")

  return (
    <>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "config" && <ConfigPage />}
      {activeTab === "favorites" && <FavoritesPage />}
    </>
  )
}
