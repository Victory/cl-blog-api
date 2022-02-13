export default class ModelUtil {
  /** Uniquifier */
  private static salt = Date.now();

  /**
   * Generate a unique and hard to guess nounce slug.
   *
   * Can generate at most one per microsecond
   */
  public static async newSlug(): Promise<string> {
    // generates a new salt every microsecond
    this.salt = await new Promise((res) => {
      const interval = setInterval(() => {
        const now = Date.now();
        if (this.salt !== now) {
          clearInterval(interval);
          res(now);
        }
      }, 0);
    });

    const rand = Math.floor(Math.random() * 1e9).toString(16);
    return this.salt.toString(16) + rand;
  }

  public static isValidSlug(slug: string) {
    return slug.match(/^[A-Za-z0-9]+$/);
  }
}
