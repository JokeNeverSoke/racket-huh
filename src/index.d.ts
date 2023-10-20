declare global {
  namespace lips {
    export async function exec(
      code: string,
      dynamic: boolean = false,
      env = null,
    ): Promise<Array<unknown>>;
  }
}
