import type { TStory } from '../types/TStory'

export const stories: TStory[] = [
  {
    id: 'missing-ring',
    title: '失踪的戒指',
    difficulty: 'easy',
    surface:
      '一枚结婚戒指不见了。房间里没有人出入。请通过提问找出戒指最终去向。',
    bottom:
      '戒指其实被主人在打扫时放进了洗衣机的内筒夹层，等衣物晾干后才发现。',
  },
  {
    id: 'late-train',
    title: '迟到的火车',
    difficulty: 'medium',
    surface:
      '有人声称自己永远不会迟到，但那天他却刚好在最后一刻才赶上火车。为什么？',
    bottom:
      '因为他乘坐的不是常规线路。当天改道后，“最后一刻”其实比别人看到的时间更早，他因此看似迟到。',
  },
  {
    id: 'silent-violin',
    title: '无声的小提琴',
    difficulty: 'hard',
    surface:
      '房间里传来小提琴声，但所有人都否认自己听到过弓与琴弦接触的声音。真相是什么？',
    bottom:
      '那不是现场演奏，而是通过隔音箱播放的录音，弓并未接触琴弦，声音来自隐藏音箱。',
  },
  {
    id: 'wrong-light',
    title: '亮错的红绿灯',
    difficulty: 'easy',
    surface:
      '十字路口，横向的绿灯已经亮了，可直行车道上的第一辆车却停着不走，后车也没有鸣笛催促。为什么？',
    bottom:
      '司机看到的是行人方向的横向绿灯；自己所在机动车道仍是红灯，停车才是正确的。',
  },
  {
    id: 'alarm-cake',
    title: '蛋糕与警铃',
    difficulty: 'easy',
    surface:
      '生日会上寿星吹灭蜡烛，几秒后大楼里警铃大作，宾客纷纷撤离。并不是恶作剧，原因是什么？',
    bottom:
      '吹蜡烛产生的烟雾触发了室内的烟雾报警器，联动了大楼消防警报。',
  },
  {
    id: 'midnight-jump',
    title: '跨年的两张照片',
    difficulty: 'medium',
    surface:
      '两人用相机各拍了一张「同一时刻」的画面，可照片上的日期显示相差整整一年。这可能吗？',
    bottom:
      '可能。拍摄瞬间正值跨年：一张在 12 月 31 日深夜，另一张在 1 月 1 日凌晨，年份自然不同。',
  },
  {
    id: 'snow-trail',
    title: '雪地的脚印',
    difficulty: 'medium',
    surface:
      '雪地上只有一排通向枯树的脚印，没有返回的脚印，可树下并没有人。人去哪了？',
    bottom:
      '人是倒退着离开现场的：倒退走时脚印方向看起来只有「去」，没有「回」。',
  },
  {
    id: 'ice-latch',
    title: '融化的锁',
    difficulty: 'hard',
    surface:
      '房门从内侧反锁，钥匙就放在屋内桌上。人先离开房间，门是如何在「外面没有钥匙」的情况下锁上的？',
    bottom:
      '离开前用冰块或低温物体卡住门闩/插销，门带上后暂时未锁实；冰块融化后门闩落下，形成从内反锁的状态。',
  },
  {
    id: 'one-word-call',
    title: '一声电话',
    difficulty: 'medium',
    surface:
      '深夜家里电话响起，接起来对方只发出一声含糊的声音就挂断，家人立刻选择报警。为什么？',
    bottom:
      '来电者突发疾病或遇险，只能发出一声；家人担心是老人误拨紧急号码或求救信号，故报警求助。',
  },
  {
    id: 'two-char-will',
    title: '两字遗言',
    difficulty: 'hard',
    surface:
      '现场只留下两个字的遗言，起初被当成自杀。后来警方改立他杀调查。什么线索让性质改变？',
    bottom:
      '笔迹鉴定显示两字是在他人控制下书写，或内容与死者习惯不符，表明并非自愿留书。',
  },
]

function assertStoriesIntegrity(list: TStory[]): void {
  const seen = new Set<string>()
  for (const s of list) {
    if (!s.id?.trim()) throw new Error('[stories] missing id')
    if (!s.title?.trim()) throw new Error(`[stories] missing title: ${s.id}`)
    if (!s.surface?.trim()) throw new Error(`[stories] missing surface: ${s.id}`)
    if (!s.bottom?.trim()) throw new Error(`[stories] missing bottom: ${s.id}`)
    if (!['easy', 'medium', 'hard'].includes(s.difficulty)) {
      throw new Error(`[stories] invalid difficulty: ${s.id}`)
    }
    if (seen.has(s.id)) throw new Error(`[stories] duplicate id: ${s.id}`)
    seen.add(s.id)
  }
}

assertStoriesIntegrity(stories)

export function getStoryById(storyId: string): TStory | undefined {
  return stories.find((s) => s.id === storyId)
}
