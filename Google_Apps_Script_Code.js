function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'save') {
      var logs = data.logs;
      if (!logs) logs = [];
      
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      
      // Group logs by company name
      var logsByCompany = {};
      
      for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        // Use companyName from log or fallback
        var companyName = log.companyName || (log.data && log.data.companyName) || "Other";
        // Clean company name to ensure valid sheet name
        companyName = companyName.toString().trim();
        if (companyName === "") companyName = "Other";
        
        if (!logsByCompany[companyName]) {
          logsByCompany[companyName] = [];
        }
        logsByCompany[companyName].push(log);
      }
      
      // Helper function to update a specific sheet
      function updateSheetForCompany(companyFullName, companyLogs) {
        // Google Sheets tab names max 31 chars
        var safeSheetName = companyFullName.substring(0, 31).replace(/[:\\/?*\[\]]/g, ' '); 
        var sheet = spreadsheet.getSheetByName(safeSheetName);
        
        if (!sheet) {
          sheet = spreadsheet.insertSheet(safeSheetName);
          // Setup headers if new sheet
          var headers = [
            "ID", 
            "Date", 
            "PR No", 
            "Requester", 
            "Department", 
            "Status", 
            "Total Items", 
            "Delivery Req", 
            "Purpose", 
            "Raw JSON (Do Not Edit)"
          ];
          sheet.appendRow(headers);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        }
        
        // Clear old rows to rewrite full state
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
        }
        
        var rows = [];
        for (var j = 0; j < companyLogs.length; j++) {
          var l = companyLogs[j];
          var pData = l.data || {};
          var itemsCount = (pData.items && pData.items.length) ? pData.items.length : 0;
          
          rows.push([
            l.id,
            l.dateCreated || l.createdAtTime || "",
            l.prNo || "",
            l.requesterName || "",
            l.department || "",
            l.status || "DRAFT",
            itemsCount,
            pData.deliveryRequirement || "",
            pData.purpose || "",
            JSON.stringify(l)
          ]);
        }
        
        if (rows.length > 0) {
          sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
        }
      }

      // Track all updated sheet names to keep them
      var updatedSheets = [];

      // Write logs into separate sheets
      for (var company in logsByCompany) {
        updateSheetForCompany(company, logsByCompany[company]);
        var safeSheetName = company.substring(0, 31).replace(/[:\\/?*\[\]]/g, ' '); 
        updatedSheets.push(safeSheetName);
      }
      
      // Clear data from sheets that were not updated (meaning they have 0 PRs now)
      var allSheets = spreadsheet.getSheets();
      for (var k = 0; k < allSheets.length; k++) {
         var sh = allSheets[k];
         var name = sh.getName();
         // If this sheet was not in our current payload, clear it
         // (You may want to protect certain non-PR sheets if you have them, e.g., using a prefix)
         if (updatedSheets.indexOf(name) === -1) {
            var lr = sh.getLastRow();
            if (lr > 1) {
              sh.getRange(2, 1, lr - 1, sh.getLastColumn()).clearContent();
            }
         }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'get') {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = spreadsheet.getSheets();
    var allLogs = [];
    
    // Read logs from ALL tabs
    for (var i = 0; i < sheets.length; i++) {
       var sheet = sheets[i];
       var lastRow = sheet.getLastRow();
       
       if (lastRow > 1) {
         // Assuming Raw JSON is in column 10 (J), as we defined in headers
         var data = sheet.getRange(2, 10, lastRow - 1, 1).getValues();
         for (var j = 0; j < data.length; j++) {
            if (data[j][0]) {
               try {
                 allLogs.push(JSON.parse(data[j][0]));
               } catch (err) {
                 // ignore parse errors for bad rows
               }
            }
         }
       }
    }
    
    return ContentService.createTextOutput(JSON.stringify(allLogs))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Ready' }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
