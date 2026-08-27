# Configuração do Ana Lopes Espaço

## 1. Criar a planilha

Abra o ficheiro `ana-lopes-espaco-template.xlsx` no Google Drive com **Novo → Upload de ficheiro**. Abra o ficheiro com o Google Sheets e, no menu **Ficheiro → Guardar como Google Sheets**, faça a conversão para uma planilha nativa.

## 2. Instalar o Apps Script

Dentro da planilha, abra **Extensões → Apps Script**. Apague o conteúdo padrão e cole todo o conteúdo do ficheiro `AppsScript_Code.gs`. Clique em **Guardar** e execute a função `setupSpreadsheet` uma vez. Na primeira execução, o Google solicitará autorização para o próprio documento.

A função cria as abas `Painel`, `Solicitações`, `Agendamentos`, `Orçamentos`, `Fluxo de caixa` e `Procedimentos`, adiciona listas de status e instala as fórmulas do painel.

## 3. Publicar o endpoint

No Apps Script, clique em **Implementar → Nova implementação**. Escolha **Aplicativo da Web**, defina **Executar como: Eu** e **Quem tem acesso: Qualquer pessoa**. Clique em **Implementar**, autorize quando solicitado e copie a URL terminada em `/exec`.

## 4. Ligar o site

No ficheiro `assets/js/main.js` do pacote do site, localize:

```js
const APPS_SCRIPT_URL = '';
```

Cole a URL do Apps Script entre as aspas. Depois, suba novamente os ficheiros do site para o GitHub Pages.

## 5. Fluxo de utilização

Cada envio do site entra na aba `Solicitações` como `Novo`. Quando o atendimento avançar, copie os dados necessários para `Agendamentos` ou `Orçamentos` e atualize o status. O painel conta automaticamente pedidos, agendamentos e orçamentos.

O fluxo de caixa é manual: na aba `Fluxo de caixa`, adicione uma linha para cada entrada ou saída. Use `Entrada` para pagamentos recebidos e `Saída` para despesas. O painel calcula as entradas, saídas e o saldo do mês atual.

## Observações importantes

O site continua a abrir uma mensagem pré-preenchida no WhatsApp. Quando a URL do Apps Script estiver configurada, o pedido será enviado para a planilha e, em seguida, a mensagem será aberta no WhatsApp para envio manual. O número do WhatsApp deve ser atualizado em `assets/js/main.js`.
