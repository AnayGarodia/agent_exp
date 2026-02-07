const { google } = require("googleapis");

/**
 * Google Sheets Service for logging Gmail actions
 */
class SheetsService {
  constructor() {
    this.spreadsheetId = null;
    this.sheetName = "Gmail Actions Log";
  }

  /**
   * Create or get the logging spreadsheet
   */
  async getOrCreateSpreadsheet(auth) {
    const sheets = google.sheets({ version: "v4", auth });

    // Check if we already have a spreadsheet ID in session
    if (this.spreadsheetId) {
      try {
        // Verify it still exists
        await sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
        return this.spreadsheetId;
      } catch (error) {
        console.log("Spreadsheet not found, creating new one");
      }
    }

    // Create new spreadsheet
    const resource = {
      properties: {
        title: `Dorian Gmail Actions Log - ${new Date().toLocaleDateString()}`,
      },
      sheets: [
        {
          properties: {
            title: this.sheetName,
          },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Timestamp" } },
                    { userEnteredValue: { stringValue: "Action" } },
                    { userEnteredValue: { stringValue: "Summary" } },
                    { userEnteredValue: { stringValue: "Response" } },
                    { userEnteredValue: { stringValue: "To/From" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await sheets.spreadsheets.create({ resource });
    this.spreadsheetId = response.data.spreadsheetId;

    // Format header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.42, green: 0.01, blue: 0.11 }, // Maroon
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
        ],
      },
    });

    return this.spreadsheetId;
  }

  /**
   * Log a Gmail action to the spreadsheet
   */
  async logAction(auth, actionData) {
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = await this.getOrCreateSpreadsheet(auth);

    const { action, summary, response, recipient } = actionData;

    const values = [
      [
        new Date().toLocaleString(),
        action,
        summary,
        response || "N/A",
        recipient || "N/A",
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${this.sheetName}!A:E`,
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    return spreadsheetId;
  }

  /**
   * Get the spreadsheet URL
   */
  getSpreadsheetUrl() {
    if (!this.spreadsheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`;
  }
}

module.exports = new SheetsService();
