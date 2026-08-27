# Ana Lopes Espaço — GitHub Pages

Versão estática do site, compatível com GitHub Pages. Os formulários abrem uma mensagem preenchida no WhatsApp e, quando `APPS_SCRIPT_URL` for configurada, também enviam os dados para uma planilha Google através do Apps Script.

## Publicação

Envie `index.html`, a pasta `assets` e `.nojekyll` para a raiz da branch `main`. Depois, em **Settings → Pages**, selecione **Deploy from a branch**, branch `main` e pasta `/root`.

## Configuração do Apps Script

No ficheiro `assets/js/main.js`, altere `const APPS_SCRIPT_URL = '';` e cole a URL `/exec` da implementação do Apps Script entre as aspas. O passo a passo completo está no ficheiro `CONFIGURACAO.md`, entregue no pacote de integração.
