/** Toy example of Encrypt/Decrypt absolutely no security. Its a place holder for a library. */
export default class CryptoUtil {
  /** Encrypt the password. Warning 0% secure. */
  public static encrypt(pwd: string): string {
    return pwd.split('').reverse().join('.');
  }

  /** Return true if the clearText encrypts to the cypherText. Warning 0% secure. */
  public static validate({
    clearText,
    cipherText,
  }: {
    clearText: string,
    cipherText: string,
  }): boolean {
    return clearText.split('').reverse().join('.') === cipherText;
  }
}
