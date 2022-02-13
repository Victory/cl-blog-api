import striptags from 'striptags';

export default class SanitizeInput {
  public static sanitize(input: string): string {
    return striptags(input);
  }
}
