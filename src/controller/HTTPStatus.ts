export default class HTTPStatus {
  public static throw404(msg: string) {
    throw new Error(`404: ${msg}`);
  }
}
