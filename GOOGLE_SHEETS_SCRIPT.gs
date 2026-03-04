function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName('Jobs');
  if (!sheet) {
    sheet = doc.insertSheet('Jobs');
    // Headers
    sheet.appendRow(['Date', 'Title', 'Company', 'Location', 'Salary', 'URL', 'Status', 'Job Type']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Jobs');
    if (!sheet) {
        setup();
        sheet = doc.getSheetByName('Jobs');
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    var newRow = [];
    var data = JSON.parse(e.postData.contents);

    // Map data to headers
    // Assumes standard headers: Date, Title, Company, Location, Salary, URL, Status, Job Type
    newRow.push(data.date || new Date());
    newRow.push(data.title || '');
    newRow.push(data.company || '');
    newRow.push(data.location || '');
    newRow.push(data.salary || '');
    newRow.push(data.url || '');
    newRow.push(data.status || 'Applied');
    newRow.push(data.jobType || '');

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
