import { ObjectId } from 'mongodb';

/**
 * Escapes characters that have special meaning in regular expressions.
 * @param text The string to escape.
 * @returns The escaped string safe to use in RegExp constructor.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates that the given string is a valid MongoDB ObjectId.
 * Throws an error if the ID is invalid.
 * @param id The ID string to validate.
 */
export function validateObjectId(id: string): void {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId');
  }
}