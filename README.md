# Course Connector MCP

Servidor MCP local da plataforma PACE. Transporte stdio, sem porta HTTP.

## Instalação

Requer Node.js 22.14+, pnpm 10 e acesso aos dois repositórios GitHub.

```bash
git clone --recurse-submodules https://github.com/abnerndr/course-connector-mcp.git
cd course-connector-mcp
pnpm install --frozen-lockfile
cp .env.example .env
pnpm check
pnpm test
```

Se clonou sem submódulos, execute `git submodule update --init --recursive` antes de instalar.

## Núcleo compartilhado

O submódulo `vendor/course-connector` fixa uma revisão do repositório [course-connector](https://github.com/abnerndr/course-connector). Apenas seu pacote `packages/core` é instalado como dependência deste servidor. Não é necessário instalar ou executar o Next.js dentro do submódulo.

Não há dependência de arquivos fora deste clone. Quando atualizar o núcleo, atualize o commit do submódulo, execute `pnpm install`, teste e versione o submódulo junto com o lockfile. Uma alteração no repositório principal não muda automaticamente a versão usada pelo MCP.

## Dados, Google e Ollama

Configure `PACE_DATA_DIR` no .env deste repositório com o mesmo caminho absoluto utilizado pelo painel. Nesta instalação: `/home/abner/www/course-connector/.pace`.

Para compartilhar dados, ambos os processos precisam acessar o mesmo disco e diretório; copiar o mesmo texto para máquinas diferentes não compartilha arquivos.

Faça a conexão OAuth pelo painel Next.js. O MCP usa os tokens salvos no diretório compartilhado; configure as mesmas credenciais GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET para renovar tokens expirados. O modelo Ollama deve ser acessível por localhost no ambiente do MCP.

Credenciais, dados e chave de criptografia não são versionados. Não conecte este servidor a clientes não confiáveis: ele dá acesso aos dados dos projetos locais.

## Cliente MCP

Use o caminho absoluto do clone:

```json
{
  "mcpServers": {
    "pace": {
      "command": "pnpm",
      "args": ["--dir", "/caminho/course-connector-mcp", "--silent", "start"]
    }
  }
}
```

O `--silent` é importante: stdout fica reservado ao protocolo MCP.

Para o Codex no Windows usando esta instalação WSL, veja `mcp.config.wsl.example.json`. O servidor é iniciado pelo cliente; executar `pnpm --silent start` manualmente apenas o deixa aguardando mensagens stdio.

## Ferramentas

- listar_projetos
- cadastrar_projeto
- consultar_projeto
- coletar_metricas
- auditar_pagina
- produzir_diagnostico
- validar_alteracao
- comparar_periodos

Aprovações e registro de implementação são feitos pelo operador no painel/CLI. Não há ferramenta para executar shell, publicar alterações no site ou aprovar propostas automaticamente.

## Verificação

`pnpm check`: tipos TypeScript.
`pnpm test`: cliente MCP real inicia o servidor, verifica as 8 ferramentas, cadastra/lê projeto temporário e verifica tratamento de erro. Dados do teste são isolados e removidos.

O smoke test não autentica uma conta Google real nem executa um modelo Ollama. Essas etapas exigem configuração do operador.
