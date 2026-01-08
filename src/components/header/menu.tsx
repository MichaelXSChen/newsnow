import { motion } from "framer-motion"

export function Menu() {
  const [shown, show] = useState(false)
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
      {shown && (
        <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
          <motion.div
            id="dropdown-menu"
            className={$([
              "w-200px",
              "bg-primary backdrop-blur-5 bg-op-70! rounded-lg shadow-xl",
            ])}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
          >
            <ol className="bg-base bg-op-70! backdrop-blur-md p-2 rounded-lg color-base text-base">
              <li className="flex gap-2 items-center justify-center text-sm op-70">
                NewsNow - 本地新闻聚合工具
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
