export default class ModelUtil {
  /** Uniquifier */
  private static salt = Date.now();

  /**
   * Generate a unique and hard to guess nounce.
   *
   * Can generate at most one per microsecond
   */
  public static async newNouce(): Promise<string> {
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

    return this.salt.toString(10);
  }
}
