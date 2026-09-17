import type { Skill } from '@/lib/api'

export interface SkillClass {
  classId: string
  representative: Skill
  versions: Skill[]
  versionCount: number
  activeCount: number
  bestScore: number
  latestUpdated: string
  tags: string[]
  totalSelections: number
}

function updatedTimestamp(skill: Skill): number {
  const parsed = Date.parse(skill.last_updated)
  return Number.isFinite(parsed) ? parsed : 0
}

function chooseRepresentative(versions: Skill[]): Skill {
  return [...versions].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1
    }
    if (left.generation !== right.generation) {
      return right.generation - left.generation
    }
    if (left.score !== right.score) {
      return right.score - left.score
    }
    return updatedTimestamp(right) - updatedTimestamp(left)
  })[0]
}

// Groups skill versions into lineage classes: versions linked via parent_skill_ids
// form one class, so the library shows one card per skill family.
export function buildSkillClasses(skills: Skill[]): SkillClass[] {
  const skillsById = new Map(skills.map((skill) => [skill.skill_id, skill]))
  const childrenByParent = new Map<string, string[]>()

  skills.forEach((skill) => {
    skill.parent_skill_ids.forEach((parentId) => {
      const children = childrenByParent.get(parentId) ?? []
      children.push(skill.skill_id)
      childrenByParent.set(parentId, children)
    })
  })

  const visited = new Set<string>()
  const classes: SkillClass[] = []

  for (const skill of skills) {
    if (visited.has(skill.skill_id)) {
      continue
    }

    const stack = [skill.skill_id]
    const versions: Skill[] = []

    while (stack.length > 0) {
      const currentId = stack.pop()
      if (!currentId || visited.has(currentId)) {
        continue
      }
      const current = skillsById.get(currentId)
      if (!current) {
        continue
      }
      visited.add(currentId)
      versions.push(current)

      current.parent_skill_ids.forEach((parentId) => {
        if (skillsById.has(parentId) && !visited.has(parentId)) {
          stack.push(parentId)
        }
      })
      ;(childrenByParent.get(currentId) ?? []).forEach((childId) => {
        if (!visited.has(childId)) {
          stack.push(childId)
        }
      })
    }

    const representative = chooseRepresentative(versions)
    const tagSet = new Set<string>()
    let totalSelections = 0

    versions.forEach((version) => {
      version.tags.forEach((tag) => tagSet.add(tag))
      totalSelections += version.total_selections
    })

    classes.push({
      classId: representative.skill_id,
      representative,
      versions,
      versionCount: versions.length,
      activeCount: versions.filter((version) => version.is_active).length,
      bestScore: Math.max(...versions.map((version) => version.score)),
      latestUpdated: [...versions].sort((a, b) => updatedTimestamp(b) - updatedTimestamp(a))[0]?.last_updated ?? representative.last_updated,
      tags: Array.from(tagSet).sort(),
      totalSelections,
    })
  }

  return classes
}
