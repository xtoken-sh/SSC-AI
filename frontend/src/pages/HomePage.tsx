import { stories } from '../lib/stories'
import GameCard from '../components/GameCard'

export default function HomePage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <section className="space-y-3 animate-fadeIn">
        <h1 className="text-3xl font-semibold tracking-tight text-amber-400 md:text-4xl">
          AI海龟汤
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          把问题问得更精准一点，就像在雾里点亮一盏灯。AI 主持人将只回答「是 / 否 /
          无关」，让你一步步接近真相。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s) => (
          <GameCard key={s.id} story={s} />
        ))}
      </section>
    </div>
  )
}

