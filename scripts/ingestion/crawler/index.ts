export { fetchPage, fetchSolutionPage, downloadFile } from "./fetcher";
export type { FetchResult } from "./fetcher";

export {
  getVisitedPages,
  markVisited,
  isVisited,
  flushVisited,
  getCompletedTasks,
  markTaskCompleted,
  isTaskCompleted,
  flushTasks,
  getCachedHtml,
  setCachedHtml,
  saveCheckpoint,
  loadCheckpoint,
  listCheckpoints,
  startAutoFlush,
  stopAutoFlush,
  flushAll,
} from "./cache";
export type { VisitedEntry, VisitedPagesMap, CompletedTasksMap, CheckpointData } from "./cache";

export { runQueue, runSequential } from "./queue";
export type { QueueTask, QueueOptions } from "./queue";
