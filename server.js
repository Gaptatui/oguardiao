import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Usa a porta fornecida pelo servidor ou 3000 como padrão
  const PORT = process.env.PORT || 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando em modo de DESENVOLVIMENTO...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando em modo de PRODUÇÃO...");
    const distPath = path.join(__dirname, 'dist');
    
    // Serve arquivos estáticos
    app.use(express.static(distPath));

    // Rota para suportar o acesso via subpasta ou raiz
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Importante: ouvir em 0.0.0.0 para ser acessível externamente
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar o servidor:", err);
  process.exit(1);
});
