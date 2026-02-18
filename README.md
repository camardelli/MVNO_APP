# MVNO_APP

Aplicação mobile desenvolvida em React Native para gestão e operação de serviços MVNO.

O projeto foi inicialmente estruturado via A0.dev e utiliza arquitetura mobile-first moderna com backend serverless totalmente integrado via Convex.

---

# Visão Geral

MVNO_APP é uma aplicação mobile construída com Expo (managed runtime), utilizando TypeScript e arquitetura desacoplada, com backend serverless executando integralmente no Convex.

A aplicação não depende de backend externo tradicional, nem de Firebase ou Supabase client-side. Toda a lógica de dados e funções de negócio é executada no Convex.

---

# Stack Tecnológica

- React Native (SDK 54)
- TypeScript
- Expo (runtime gerenciado)
- React Navigation (Stack + Tabs)
- Zustand (gerenciamento de estado)
- expo-av (reprodução de vídeo / splash screen)
- Convex (database + serverless functions)
- a0 platform (build, hospedagem, deploy e OTA updates)

---

# Arquitetura

Arquitetura mobile-first com backend serverless integrado:

```
Mobile App (Expo + React Native)
        ↓
State Layer (Zustand)
        ↓
Convex (Serverless Database + Functions)
        ↓
a0 Platform (Build + Deploy + OTA)
```

Características:

- Backend totalmente serverless
- Sem dependência de backend dedicado
- Atualizações OTA controladas
- Estrutura modular por telas

---

# Estrutura do Projeto

```
/app
  /screens
  /components
  /navigation
  /store
    useAppStore.ts
/convex
  /functions
  /schema
/assets
```

A estrutura pode evoluir conforme modularização futura.

---

# Backend (Convex)

O Convex é responsável por:

- Banco de dados
- Funções serverless
- Regras de negócio
- Segurança e controle de acesso

Ambiente de desenvolvimento:

```bash
npx convex dev
```

Deploy:

```bash
npx convex deploy
```

---

# Gerenciamento de Estado

O estado global é gerenciado via Zustand:

```
store/useAppStore.ts
```

Características:

- Leve
- Simples
- Sem boilerplate excessivo
- Alto desempenho

---

# Navegação

Implementada com React Navigation:

- Stack Navigator
- Bottom Tabs
- Estrutura modular por telas

---

# Como Rodar Localmente

1. Instalar dependências:

```bash
npm install
```

ou

```bash
yarn
```

2. Iniciar o ambiente Expo:

```bash
npx expo start
```

---

# Deploy

Deploy realizado via:

- a0 platform
- Expo managed workflow
- OTA updates habilitados

---

# Segurança

- Nenhuma credencial é versionada
- Variáveis sensíveis via ambiente
- Backend isolado no Convex
- Sem dependência de Firebase ou backend externo

---

# Não Utiliza

- Redux
- Firebase
- Supabase client-side
- Backend dedicado externo

---

# Roadmap

- Consolidação de fluxos MVNO
- Autenticação robusta
- Gestão de planos e usuários
- Observabilidade e hardening enterprise
- Escalabilidade e monitoramento

---

# Status

Projeto em desenvolvimento ativo.

---

# Autor

Alberto Camardelli

