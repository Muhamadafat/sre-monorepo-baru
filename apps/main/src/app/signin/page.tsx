"use client";

import {
  Box,
  Button,
  Checkbox,
  Group,
  Image,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
} from "@mantine/core";
import { useState } from "react";
import NextImage from "next/image";
import { IconEye, IconEyeOff, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

// Gambar
// import logoImage from "../imageCollection/LogoSRE_Fix.png";
// import backgroundImage from "../imageCollection/login-background.png";
// import illustrationImage from "../imageCollection/login-illustration.png";

import { signIn } from "../actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn({
        email: email,
        password: password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        // Tunggu sebentar untuk memastikan session ter-set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Client-side redirect ke brain app
        // const brainUrl = `${process.env.NEXT_PUBLIC_BRAIN_APP_URL || 'http://brain.lvh.me:3001'}/`;
        const profileUrl = `${process.env.NEXT_PUBLIC_PROFILE_APP_URL || 'http://profile.lvh.me:3002/dashboard'}/`;
        console.log('Redirecting to:', profileUrl);
        
        // Force full page navigation untuk cross-domain
        window.location.href = profileUrl;
        // window.open(profileUrl, '_blank');
        
        // Alternative untuk same domain:
        // router.push(brainUrl);
        // router.refresh();
      } else {
        // Jika tidak ada result atau result tidak sesuai ekspektasi
        setError("Unexpected response from server");
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        height: "100vh",
        backgroundImage: `url('/images/login-background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        style={{
          width: "90%",
          maxWidth: 1100,
          height: "85vh",
          display: "flex",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "light-dark(white, var(--mantine-color-dark-6))",
        }}
      >
        {/* Panel Kiri - Form Login */}
        <Box
          style={{
            width: "55%",
            backgroundColor: "light-dark(white, var(--mantine-color-dark-6))",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box style={{ textAlign: "center", marginBottom: 24 }}>
            <Title order={1} fw={800} mb={4} style={{ color: "light-dark(var(--mantine-color-dark-9), var(--mantine-color-gray-0))" }}>
              MASUK
            </Title>
            <Text c="dimmed" size="sm">
              Masukkan email Anda untuk login ke akun Anda
            </Text>
          </Box>

          <form onSubmit={handleSignIn}>
            <Stack>
              {error && (
                <Alert 
                  icon={<IconAlertCircle size="1rem" />} 
                  color="red" 
                  variant="filled"
                  mb="md"
                >
                  {error}
                </Alert>
              )}

              <Text fw={600}>Email</Text>
              <TextInput
                placeholder="Masukkan email Anda..."
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                type="email"
                disabled={loading}
                styles={{
                  input: {
                    backgroundColor: "light-dark(white, var(--mantine-color-dark-7))",
                    borderColor: "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))",
                    color: "light-dark(var(--mantine-color-dark-9), var(--mantine-color-gray-0))",
                    '&::placeholder': {
                      color: "light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
                    }
                  }
                }}
              />

              <Text fw={600}>Kata Sandi</Text>
              <PasswordInput
                placeholder="Masukkan kata sandi Anda..."
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                visible={showPassword}
                onVisibilityChange={setShowPassword}
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? <IconEyeOff /> : <IconEye />
                }
                required
                disabled={loading}
                styles={{
                  input: {
                    backgroundColor: "light-dark(white, var(--mantine-color-dark-7))",
                    borderColor: "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))",
                    color: "light-dark(var(--mantine-color-dark-9), var(--mantine-color-gray-0))",
                    '&::placeholder': {
                      color: "light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
                    }
                  }
                }}
              />

              <Group justify="space-between" mt="xs">
                <Checkbox
                  label="Ingat saya"
                  checked={remember}
                  onChange={(e) => setRemember(e.currentTarget.checked)}
                  disabled={loading}
                />
                <Text size="sm" c="blue" style={{ cursor: "pointer" }}>
                  Lupa kata sandi?
                </Text>
              </Group>

              <Button 
                fullWidth 
                mt="md" 
                size="md" 
                color="blue" 
                radius="md" 
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {loading ? "Masuk..." : "Masuk"}
              </Button>
              {/* Tambahkan navigasi ke Sign Up */}
              <Text ta="center" size="sm" mt="md">
                Belum punya akun?{" "}
                <Text 
                  component="span" 
                  c="blue" 
                  fw={600}
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push('/signup')}
                >
                  Daftar di sini
                </Text>
              </Text>
            </Stack>
          </form>
        </Box>

        {/* Panel Kanan - Ilustrasi */}
        <Box
          style={{
            width: "45%",
            backgroundColor: "#0057b7",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "white",
          }}
        >
          <Image
            component={NextImage}
            src='/images/logoSRE.png'
            alt="My-SRE Logo"
            width={160}
            height={50}
            fit="contain"
            style={{ alignSelf: "flex-start" }}
          />

          <Box style={{ textAlign: "center" }}>
            <Image
              component={NextImage}
              src='/images/login-illustration.png'
              alt="Illustration"
              width={350}
              height={350}
              fit="contain"
              style={{ margin: "0 auto" }}
            />
          </Box>

          <Text size="xs" style={{ textAlign: "center" }}>
            My-SRE © 2025
          </Text>
        </Box>
      </Box>
    </Box>
  );
}