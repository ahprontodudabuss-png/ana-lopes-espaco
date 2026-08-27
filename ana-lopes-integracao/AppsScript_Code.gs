const CONFIG = {
  spreadsheetId: '', // Opcional: deixe vazio se o script for criado dentro da própria planilha.
  timezone: 'America/Sao_Paulo',
  sheetNames: {
    dashboard: 'Painel',
    requests: 'Solicitações',
    appointments: 'Agendamentos',
    quotes: 'Orçamentos',
    cashflow: 'Fluxo de caixa',
    procedures: 'Procedimentos'
  }
};

function getSpreadsheet_() {
  if (CONFIG.spreadsheetId) return SpreadsheetApp.openById(CONFIG.spreadsheetId);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Ana Lopes Espaço')
    .addItem('Preparar / atualizar estrutura', 'setupSpreadsheet')
    .addItem('Atualizar painel', 'updateDashboard')
    .addToUi();
}

function setupSpreadsheet() {
  const ss = getSpreadsheet_();
  const names = CONFIG.sheetNames;
  const definitions = {
    [names.dashboard]: ['Indicador', 'Valor', 'Atualizado em'],
    [names.requests]: ['ID', 'Data de recebimento', 'Tipo', 'Nome', 'Telefone', 'E-mail', 'Procedimento', 'Data desejada', 'Observações', 'Status'],
    [names.appointments]: ['ID', 'Data', 'Hora', 'Cliente', 'Telefone', 'Procedimento', 'Valor', 'Forma de pagamento', 'Status', 'Observações'],
    [names.quotes]: ['ID', 'Data', 'Cliente', 'Telefone', 'Procedimento', 'Valor proposto', 'Validade', 'Status', 'Observações'],
    [names.cashflow]: ['ID', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Forma de pagamento', 'Observações'],
    [names.procedures]: ['Procedimento', 'Duração', 'Preço-base', 'Ativo']
  };

  Object.keys(definitions).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = definitions[name];
    if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader_(sheet, headers.length);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  seedProcedures_(ss.getSheetByName(names.procedures));
  setupDashboard_(ss.getSheetByName(names.dashboard), ss);
  applyValidations_(ss);
  updateDashboard();
  SpreadsheetApp.getUi().alert('Estrutura do Ana Lopes Espaço preparada com sucesso.');
}

function styleHeader_(sheet, columnCount) {
  sheet.getRange(1, 1, 1, columnCount)
    .setBackground('#40378c')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 30);
}

function seedProcedures_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 4, 4).setValues([
    ['Design de sobrancelhas', '45 min', 75, 'Sim'],
    ['Maquiagem social', '1h30', 220, 'Sim'],
    ['Produção para noivas', 'Sob consulta', '', 'Sim'],
    ['Debutantes', 'Sob consulta', '', 'Sim']
  ]);
  sheet.getRange('C2:C5').setNumberFormat('R$ #,##0.00');
}

function setupDashboard_(sheet, ss) {
  sheet.clearContents();
  sheet.getRange('A1:C1').setValues([['Indicador', 'Valor', 'Atualizado em']]);
  sheet.getRange('A2:A9').setValues([
    ['Solicitações recebidas'],
    ['Agendamentos confirmados'],
    ['Próximos agendamentos'],
    ['Orçamentos em aberto'],
    ['Orçamentos aprovados'],
    ['Entradas do mês'],
    ['Saídas do mês'],
    ['Saldo do mês']
  ]);
  sheet.getRange('B2').setFormula(`=COUNTA('${CONFIG.sheetNames.requests}'!A2:A)`);
  sheet.getRange('B3').setFormula(`=COUNTIF('${CONFIG.sheetNames.appointments}'!I2:I,"Confirmado")`);
  sheet.getRange('B4').setFormula(`=COUNTIFS('${CONFIG.sheetNames.appointments}'!B2:B,">="&TODAY(),'${CONFIG.sheetNames.appointments}'!I2:I,"<>Cancelado")`);
  sheet.getRange('B5').setFormula(`=COUNTIF('${CONFIG.sheetNames.quotes}'!H2:H,"Em análise")+COUNTIF('${CONFIG.sheetNames.quotes}'!H2:H,"Enviado")`);
  sheet.getRange('B6').setFormula(`=COUNTIF('${CONFIG.sheetNames.quotes}'!H2:H,"Aprovado")`);
  sheet.getRange('B7').setFormula(`=SUMIFS('${CONFIG.sheetNames.cashflow}'!F2:F,'${CONFIG.sheetNames.cashflow}'!C2:C,"Entrada",'${CONFIG.sheetNames.cashflow}'!B2:B,">="&EOMONTH(TODAY(),-1)+1,'${CONFIG.sheetNames.cashflow}'!B2:B,"<="&EOMONTH(TODAY(),0))`);
  sheet.getRange('B8').setFormula(`=SUMIFS('${CONFIG.sheetNames.cashflow}'!F2:F,'${CONFIG.sheetNames.cashflow}'!C2:C,"Saída",'${CONFIG.sheetNames.cashflow}'!B2:B,">="&EOMONTH(TODAY(),-1)+1,'${CONFIG.sheetNames.cashflow}'!B2:B,"<="&EOMONTH(TODAY(),0))`);
  sheet.getRange('B9').setFormula('=B7-B8');
  sheet.getRange('B7:B9').setNumberFormat('R$ #,##0.00');
  sheet.getRange('C2:C9').setValue(new Date()).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange('A1:C9').setBorder(true, true, true, true, true, true, '#d8d4de', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('A2:A9').setFontWeight('bold');
  sheet.autoResizeColumns(1, 3);
}

function applyValidations_(ss) {
  const requests = ss.getSheetByName(CONFIG.sheetNames.requests);
  const appointments = ss.getSheetByName(CONFIG.sheetNames.appointments);
  const quotes = ss.getSheetByName(CONFIG.sheetNames.quotes);
  const cashflow = ss.getSheetByName(CONFIG.sheetNames.cashflow);
  requests.getRange('J2:J1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Novo', 'Em contato', 'Convertido', 'Arquivado']).setAllowInvalid(false).build());
  appointments.getRange('I2:I1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pré-reserva', 'Confirmado', 'Concluído', 'Cancelado']).setAllowInvalid(false).build());
  quotes.getRange('H2:H1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Em análise', 'Enviado', 'Aprovado', 'Recusado']).setAllowInvalid(false).build());
  cashflow.getRange('C2:C1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Entrada', 'Saída']).setAllowInvalid(false).build());
  cashflow.getRange('F2:F1000').setNumberFormat('R$ #,##0.00');
  appointments.getRange('G2:G1000').setNumberFormat('R$ #,##0.00');
  quotes.getRange('F2:F1000').setNumberFormat('R$ #,##0.00');
}

function updateDashboard() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.sheetNames.dashboard);
  if (!sheet) return;
  sheet.getRange('C2:C9').setValue(new Date()).setNumberFormat('dd/MM/yyyy HH:mm');
  SpreadsheetApp.flush();
}

function doGet() {
  return jsonOutput_({ ok: true, service: 'Ana Lopes Espaço', message: 'Endpoint ativo.' });
}

function doPost(e) {
  try {
    const data = parseRequest_(e);
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(CONFIG.sheetNames.requests) || ss.insertSheet(CONFIG.sheetNames.requests);
    const now = new Date();
    const id = 'SOL-' + Utilities.formatDate(now, CONFIG.timezone, 'yyyyMMdd-HHmmss');
    sheet.appendRow([
      id,
      now,
      data.form_type === 'orcamento' ? 'Orçamento' : 'Agendamento',
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || 'Ainda não sei',
      data.date || '',
      data.message || '',
      'Novo'
    ]);
    updateDashboard();
    return jsonOutput_({ ok: true, id: id, message: 'Solicitação registrada.' });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error) });
  }
}

function parseRequest_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (ignore) {}
  }
  return e.parameter || {};
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
