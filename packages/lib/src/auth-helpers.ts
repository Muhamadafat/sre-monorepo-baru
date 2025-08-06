// packages/lib/src/auth-helpers.ts
import { SupabaseClient } from '@supabase/supabase-js';

interface SignInParams {
  email: string;
  password?: string;
}

interface SignUpParams extends SignInParams {
  fullName: string;
  sid: string;
  group: string;
}

/**
 * Fungsi untuk melakukan sign in dengan email dan password.
 * @param supabase Instance SupabaseClient.
 * @param params Objek berisi email dan password.
 * @returns Data pengguna setelah sign in.
 * @throws Error jika sign in gagal.
 */
export async function sharedSignIn(supabase: SupabaseClient, params: SignInParams) {
  const { email, password } = params;
  if (!password) {
    throw new Error('Password is required for sign in.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Fungsi untuk melakukan sign up pengguna baru.
 * Ini hanya menangani bagian Supabase Auth.
 * Penyimpanan data profil tambahan ke database (misalnya dengan Prisma) akan ditangani di Server Action.
 * @param supabase Instance SupabaseClient.
 * @param params Objek berisi email dan password.
 * @returns Data pengguna setelah sign up.
 * @throws Error jika sign up gagal.
 */
export async function sharedSignUp(supabase: SupabaseClient, params: SignUpParams) {
  const { email, password, fullName, sid, group } = params; // fullName, sid, group hanya untuk type safety, tidak digunakan langsung di Supabase Auth
  if (!password) throw new Error('Password is required for sign up.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Supabase options.data bisa digunakan untuk menyimpan metadata sederhana
    // Tetapi untuk data user yang lebih terstruktur, disarankan menggunakan database terpisah (seperti Prisma)
    options: {
      data: {
        full_name: fullName,
        sid: sid,
        group: group,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Fungsi untuk melakukan sign out pengguna.
 * @param supabase Instance SupabaseClient.
 * @throws Error jika sign out gagal.
 */
export async function sharedSignOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Fungsi untuk mendapatkan sesi pengguna saat ini.
 * @param supabase Instance SupabaseClient.
 * @returns Sesi pengguna atau null jika tidak ada sesi.
 * @throws Error jika terjadi kesalahan saat mendapatkan sesi.
 */
export async function getSession(supabase: SupabaseClient) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}