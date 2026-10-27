import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as core from "@pace/core";
const server = new McpServer({ name: "pace-local", version: "0.1.0" });
const projectId = z.string().uuid();
function register(
  name: string,
  description: string,
  schema: Record<string, z.ZodTypeAny>,
  run: (args: any) => Promise<unknown>,
  readOnly = false,
) {
  server.tool(
    name,
    description,
    schema,
    { readOnlyHint: readOnly, destructiveHint: false, openWorldHint: true },
    async (args) => {
      try {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(await run(args), null, 2),
            },
          ],
        };
      } catch (e) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: e instanceof Error ? e.message : "Falha na operação",
            },
          ],
        };
      }
    },
  );
}
register(
  "listar_projetos",
  "Lista projetos locais e estado da conexão Google",
  {},
  () => core.projects(),
  true,
);
register(
  "cadastrar_projeto",
  "Cadastra projeto com propriedade Search Console e GA4",
  core.projectInput.shape,
  (a) => core.createProject(a),
);
register(
  "consultar_projeto",
  "Retorna métricas, evidências, tarefas e validações",
  { projectId },
  (a) => core.overview(a.projectId),
  true,
);
register(
  "coletar_metricas",
  "Coleta métricas reais do Google e salva um snapshot",
  { projectId, startDate: z.string(), endDate: z.string() },
  (a) => core.collectMetrics(a.projectId, a.startDate, a.endDate),
);
register(
  "auditar_pagina",
  "Audita HTML público de uma página do projeto",
  { projectId, url: z.string().url().optional() },
  (a) => core.auditPage(a.projectId, a.url),
);
register(
  "produzir_diagnostico",
  "Usa Ollama local para diagnosticar evidências e propor tarefas",
  { projectId },
  (a) => core.diagnose(a.projectId),
);
register(
  "validar_alteracao",
  "Reaudita uma tarefa já marcada como implementada no painel",
  { taskId: z.string().uuid() },
  (a) => core.validateTask(a.taskId),
);
register(
  "comparar_periodos",
  "Compara snapshots de períodos iguais e não sobrepostos",
  { projectId, beforeId: z.string().uuid(), afterId: z.string().uuid() },
  (a) => core.comparePeriods(a.projectId, a.beforeId, a.afterId),
  true,
);
await server.connect(new StdioServerTransport());
