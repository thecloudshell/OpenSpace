import asyncio

from openspace.runtime.skill_registry import build_skill_registry
from openspace.skill_engine import SkillStore

SKILL_DIRS = ["/host-skills"]
DB_PATH = "/workspace/.openspace/openspace.db"


async def main() -> None:
    registry = build_skill_registry(configured_skill_dirs=SKILL_DIRS)
    if registry is None:
        raise SystemExit("registry build failed")
    discovered = registry.discover()
    print(f"discovered: {len(discovered)} skills")
    store = SkillStore(db_path=DB_PATH)
    try:
        created = await store.sync_from_registry(discovered)
        print(f"synced: {created} new records")
    finally:
        store.close()


asyncio.run(main())
