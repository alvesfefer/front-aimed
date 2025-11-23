
</div>

<br />

#  **Sistema Médico–Paciente · Plataforma Integrada com Fluxo Assíncrono**

Um ecossistema digital projetado para conectar **médicos e pacientes em tempo real**, simulando a dinâmica de um sistema clínico moderno — consultas, triagens, mensagens e rotinas totalmente sincronizadas, fluindo como um coração batendo em harmonia.

Construído em **TypeScript + React**, com arquitetura modular e inspirada em microserviços, o projeto integra **duas áreas independentes** que compartilham um único estado central, garantindo que qualquer ação realizada em um painel seja imediatamente refletida no outro.

> *Um sistema que respira junto com o usuário — verde e azul, pulsando como um monitor cardíaco.*

---

#  **Funcionalidades Principais**

###  Área do Médico

* Dashboard sincronizado com o paciente
* Acesso instantâneo ao chat, triagem e marcações
* Histórico clínico sincronizado
* Gestão visual de consultas
* Acompanhamento de medicamentos prescritos
* Visual “profissional suave” — verde + azul

###  Área do Paciente

* Chat em tempo real com o médico
* Marcação de consultas
* Triagem automatizada
* Painel com evolução clínica
* **Farmácia estilizada como uma geladeira elegante**, com porta animada e acesso a medicamentos prescritos (valores, descrição e uso)

###  Tela de Entrada

* Nome do sistema com tipografia fluida nas cores do projeto
* Animação simulando batidas do coração
* Transição suave para a escolha entre Médico ou Paciente

---

#  **Sincronização em Tempo Real**

Mesmo rodando localmente, o sistema já funciona de forma **assíncrona**, simulando um fluxo de dados onde:

* mensagens enviadas pelo paciente aparecem automaticamente para o médico
* consultas marcadas surgem no painel médico instantaneamente
* triagens realizadas são enviadas diretamente ao doutor
* e tudo isso sem recarregar a página

Isso é possível através de um **estado global compartilhado**, que poderá ser substituído futuramente por **WebSockets (Socket.io), Firebase Realtime ou Supabase** para comunicação em tempo real distribuída.

---

#  **Tecnologias Utilizadas**

* **TypeScript**
* **React + Vite**
* **Context API / Zustand (estado global)**
* **CSS Modules / Tailwind (dependendo da tua escolha)**
* **Arquitetura inspirada em microserviços**
* **Design orientado a componentes reutilizáveis**

---

#  **Como Rodar o Projeto Localmente**

**Pré-requisitos:** Node.js instalado.

1. Instale as dependências

   ```bash
   npm install
   ```

2. Configure sua chave da Gemini API em `.env.local`

   ```
   GEMINI_API_KEY=coloque_sua_chave_aqui
   ```

3. Inicie o servidor

   ```bash
   npm run dev
   ```

---

#  **Roadmap**

* [ ] Implementar WebSocket em produção
* [ ] Multi-usuário real, com login e autenticação
* [ ] Banco de dados para histórico clínico
* [ ] Modo escuro (tema hospital futurista)
* [ ] Dashboard 3D da Farmácia/Geladeira

---

# 📌 **Sobre o Projeto**

Este sistema foi desenvolvido como parte de um TCC, com foco em entregar uma solução moderna que simula o fluxo real entre médico e paciente.
O objetivo é demonstrar uma arquitetura profissional, responsiva, modular e escalável — pronta para crescer para mobile ou cloud.

