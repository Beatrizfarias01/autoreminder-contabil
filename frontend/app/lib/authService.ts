import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Tipos ──────────────────────────────────────────

export interface LoginPayload {
  email: string
  senha: string
  lembrar?: boolean
}

export interface CadastroPayload {
  nomeCompleto: string
  nomeEscritorio: string
  email: string
  telefone: string
  senha: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  usuario: {
    id: string
    nome: string
    email: string
    nomeEscritorio: string
  }
}

// ── Funções ────────────────────────────────────────

export async function login(dados: LoginPayload): Promise<AuthResponse> {
  const res = await api.post('/auth/login', dados)
  return res.data
}

export async function cadastrar(dados: CadastroPayload): Promise<AuthResponse> {
  const res = await api.post('/auth/cadastro', dados)
  return res.data
}

export async function recuperarSenha(email: string): Promise<void> {
  await api.post('/auth/recuperar-senha', { email })
}

export async function redefinirSenha(
  token: string,
  senha: string
): Promise<void> {
  await api.post('/auth/redefinir-senha', { token, senha })
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem('accessToken')
  await api.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// ── Helpers de token ───────────────────────────────

export function salvarTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export function pegarToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function estaLogado(): boolean {
  return !!localStorage.getItem('accessToken')
}