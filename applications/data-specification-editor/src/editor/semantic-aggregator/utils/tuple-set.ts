/**
 * Data structure representing a set of tuples.
 * It supports reading and removing by both keys.
 */
export class TupleSet<A, B> {
  private readonly forward: Map<A, Set<B>> = new Map();
  private readonly reverse: Map<B, Set<A>> = new Map();

  add(key: A, value: B) {
    if (!this.forward.has(key)) {
      this.forward.set(key, new Set());
    }
    this.forward.get(key)!.add(value);

    if (!this.reverse.has(value)) {
      this.reverse.set(value, new Set());
    }
    this.reverse.get(value)!.add(key);
  }

  deleteFirst(val: A) {
    const values = this.forward.get(val);
    if (values) {
      for (const value of values) {
        this.reverse.get(value)!.delete(val);
        if (this.reverse.get(value)!.size === 0) {
          this.reverse.delete(value);
        }
      }
    }
    return this.forward.delete(val);
  }

  deleteSecond(val: B) {
    const keys = this.reverse.get(val);
    if (keys) {
      for (const key of keys) {
        this.forward.get(key)!.delete(val);
        if (this.forward.get(key)!.size === 0) {
          this.forward.delete(key);
        }
      }
    }
    return this.reverse.delete(val);
  }

  getByFirst(key: A): B[] {
    const val = this.forward.get(key);
    return val ? [...val] : [];
  }

  getBySecond(key: B): A[] {
    const val = this.reverse.get(key);
    return val ? [...val] : [];
  }

  overrideByFirst(key: A, values: B[]) {
    this.deleteFirst(key);
    for (const value of values) {
      this.add(key, value);
    }
  }

  overrideBySecond(key: B, values: A[]) {
    this.deleteSecond(key);
    for (const value of values) {
      this.add(value, key);
    }
  }
}
