
/**
 * @returns A new array with item on given position replaced.
 */
export function arrayReplace<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

/**
 * @returns A new array with given item inserted at given position.
 */
export function arrayInsert<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index)];
}

/**
 * @returns A new array with item on given index removed.
 */
export function arrayRemove<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

// Slightly modified https://stackoverflow.com/questions/22697936/binary-search-in-javascript
export function binarySearch(arr: [string, number][], val: number) {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (arr[mid]?.[1] === val) {
      return mid;
    }

    if (val < (arr[mid]?.[1] as number)) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return -1;
}