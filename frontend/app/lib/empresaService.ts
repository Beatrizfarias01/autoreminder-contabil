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

export interface Empresa {
  id: string
  razaoSocial: string
  cnpj: string
  nomeResponsavel: string
  whatsapp: string
  email: string
  ativo: boolean
}

export interface EmpresaPayload {
  razaoSocial: string
  cnpj: string
  nomeResponsavel: string
  whatsapp: string
  email: string
}

export async function listarEmpresas(): Promise<Empresa[]> {
  const res = await api.get('/empresas/')
  return res.data
}

export async function criarEmpresa(dados: EmpresaPayload): Promise<Empresa> {
  const res = await api.post('/empresas/', dados)
  return res.data
}

export async function excluirEmpresa(id: string): Promise<void> {
  await api.delete(`/empresas/${id}`)
}

export async function atualizarEmpresa(id: string, dados: Partial<EmpresaPayload>): Promise<Empresa> {
  const res = await api.put(`/empresas/${id}`, dados)
  return res.data
}