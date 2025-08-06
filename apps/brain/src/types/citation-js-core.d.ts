declare module '@citation-js/core' {
  export class Cite {
    static async(risContent: string) {
      throw new Error('Method not implemented.');
    }
    constructor(data: string | object | any);

    format(
      type: string,
      options?: {
        format?: string;
        template?: string;
        lang?: string;
      }
    ): string;
  }
}
