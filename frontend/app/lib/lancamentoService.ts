import axios from 'axios'
import { pegarToken } from './authService'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = pegarToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface Lancamento {
  id: string
  empresaId: string
  tipoImposto: string
  valor: number
  vencimento: string
  linkGuia?: string
  recorrente: boolean
  prazos: string
  status: string
}

export interface LancamentoPayload {
  empresaId: string
  tipoImposto: string
  valor: number
  vencimento: string
  linkGuia?: string
  recorrente?: boolean
  prazos?: string[]
}

export async function listarLancamentos(): Promise<Lancamento[]> {
  const res = await api.get('/lancamentos/')
  return res.data
}

export async function criarLancamento(dados: LancamentoPayload): Promise<Lancamento> {
  const res = await api.post('/lancamentos/', dados)
  return res.data
}

export async function cancelarLancamento(id: string): Promise<void> {
  await api.delete(`/lancamentos/${id}`)
}

export async function atualizarStatusLancamento(id: string, status: string): Promise<Lancamento> {
  const res = await api.put(`/lancamentos/${id}`, { status })
  return res.data
}