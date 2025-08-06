// D:\sre-monorepo\sre-monorepo\packages\types\src\citation-js-core.d.ts

declare module '@citation-js/core' {
  export class Cite {
    // Metode statis harus dideklarasikan tanpa body (implementasi).
    // 'static async' itu tidak diperlukan di sini, cukup 'static' untuk menandakan itu metode statis.
    // Tipe kembalian (misalnya Promise<any>) harus eksplisit jika itu async.
    static async(risContent: string): Promise<any>; // <-- Perhatikan: tidak ada '{}'

    // Konstruktor juga hanya deklarasi, tidak ada body.
    constructor(data: string | object | any); // <-- Perhatikan: tidak ada '{}'

    // Metode instance juga hanya deklarasi, tidak ada body.
    format(
      type: string,
      options?: {
        format?: string;
        template?: string;
        lang?: string;
      }
    ): string; // <-- Perhatikan: tidak ada '{}'
  }
}

declare module '@citation-js/plugin-ris' {
  // Ini mungkin kosong jika plugin tidak mengekspor apa-apa secara langsung,
  // atau tambahkan deklarasi jika ada API yang diekspor.
  // Biasanya, plugin hanya mendaftarkan diri ke core.
}