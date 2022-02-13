import BlogPostModel from '../model/blogs/BlogPostModel';
import UserModel from '../model/user/UserModel';
import UserPublicModel from '../model/user/UserPublicModel';

type ValueType = BlogPostModel | UserModel | UserPublicModel;

/** Simulate a persitence layer database */
class Db {
  private readonly data: { [key: string]: ValueType };

  /** locks the database for right */
  private lockPromise: Promise<void>;

  /** called to unlock the database */
  private lockRes: VoidFunction;

  constructor() {
    this.data = {};
    this.lockPromise = Promise.resolve();
    this.lockRes = () => {};
  }

  /** Call the `cb` function as a transaction. Return the value of cb */
  public async runTransaction<T>(cb: () => Promise<T>): Promise<T> {
    try {
      this.beginTransaction();
      return await cb();
    } finally {
      this.endTransaction();
    }
  }

  /** Set data object from the database */
  public async setObject(key: string, val: ValueType): Promise<void> {
    await Db.slow();
    this.data[key] = val;
  }

  /** Get data object from the database */
  public async getObject<T extends ValueType>(key: string): Promise<T | null> {
    await Db.slow();
    const d = this.data[key] as T;
    return d;
  }

  /**
   * Get data list objects from the database that have key with the prefix
   * `keyPrefix`. Optionally filter by `filterPredicate`.
   */
  public async getObjects<T extends ValueType>({
    keyPrefix,
    filterPredicate,
  }: {
    keyPrefix: string,
    filterPredicate?: (t: T) => boolean,
  }): Promise<T[]> {
    await Db.slow();

    const d: T[] = Object.keys(this.data)
      .filter((kk: string) => kk.startsWith(keyPrefix))
      .map((kk: string) => this.data[kk] as T);

    return (filterPredicate) ? d.filter(filterPredicate) : d;
  }

  /** Simulate network and database wait time */
  private static slow() {
    return new Promise((res) => {
      setTimeout(() => {
        res(null);
      }, 20);
    });
  }

  /** Begin the "transaction". */
  private async beginTransaction(): Promise<void> {
    await this.lockPromise;
    this.lockPromise = new Promise((res) => {
      this.lockRes = res;
    });
  }
  /** End the "transaction". */

  private endTransaction(): void {
    // TODO implement roll-back
    this.lockRes();
  }
}

const db = new Db();

export default db;
