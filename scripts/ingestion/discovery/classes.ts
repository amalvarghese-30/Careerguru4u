/**
 * Class discovery — returns all known classes for a board from COURSE_IDS.
 */
import { getBoardClasses, getCourse } from "../config/boards";
import type { BoardKey, DiscoveredClass } from "../types";

export async function discoverClasses(boardKey: BoardKey): Promise<DiscoveredClass[]> {
  const classes: DiscoveredClass[] = [];
  const classNums = getBoardClasses(boardKey);

  for (const classNum of classNums) {
    const course = getCourse(boardKey, classNum);
    if (!course) continue;

    classes.push({
      classNum,
      courseId: course.id,
      courseSlug: course.slug,
      medium: course.medium,
    });
  }

  return classes;
}
