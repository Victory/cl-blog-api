export default class CSLogger {
  /** Logging function, todo use `process.env` to change behavior on dev, staging and prod */
  public static log(...data: any[]) {
    // eslint-disable-next-line no-console
    console.log.apply(console.log, data);
  }
}
