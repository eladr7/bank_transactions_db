import path from "path";
import sqlite3 from "sqlite3";
import { Transform } from "stream";
const dotenv = require("dotenv").config();

export class BankTransactionsDB {
  private db: sqlite3.Database;

  constructor() {
    const dbFilePath = this.getDBFilePath();
    this.db = new sqlite3.Database(dbFilePath);
    this.db.serialize(() => {
      this.db.run(`
          CREATE TABLE IF NOT EXISTS transactions (
              accountMask INTEGER,
              postedDate DATE,
              description TEXT,
              details TEXT,
              amount INTEGER,
              balance INTEGER,
              referenceNumber TEXT,
              currency TEXT,
              type TEXT,
              createdTime DATETIME,
              updatedTime DATETIME,
              PRIMARY KEY (accountMask, postedDate, description)
          );
        `);
    });
  }

  async insertCSVLinesIntoDB(csvLines: Transform): Promise<any[]> {
    const bankTransactions: any[] = await this.getFormattedBankTransactions(
      csvLines
    );

    const stmt = this.db.prepare(`
        REPLACE INTO transactions (accountMask, postedDate, description, details, amount, balance, referenceNumber, currency, type, createdTime, updatedTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const transaction of bankTransactions) {
      stmt.run(
        transaction.accountMask,
        transaction.postedDate,
        transaction.description,
        transaction.details,
        transaction.amount,
        transaction.balance,
        transaction.referenceNumber !== null
          ? transaction.referenceNumber
          : null,
        transaction.currency,
        transaction.type,
        transaction.createdTime.toISOString(),
        transaction.updatedTime.toISOString()
      );
    }

    stmt.finalize();

    return bankTransactions;
  }

  async getTransactions(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM transactions", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private getDBFilePath() {
    const dbFilePath = process.env.DB_FILE_PATH;

    if (!dbFilePath) {
      throw new Error(
        "DB_FILE_PATH is not defined in the environment variables."
      );
    }
    const fullPath = path.join(__dirname, dbFilePath);
    return fullPath;
  }

  private async getFormattedBankTransactions(
    csvLines: Transform
  ): Promise<any[]> {
    const bankTransactions: any[] = [];
    for await (const data of csvLines) {
      const transaction = {
        accountMask: data.account_mask,
        postedDate: data.posted_date,
        description: data.description,
        details: data.details,
        amount: data.amount,
        balance: data.balance,
        referenceNumber: data.reference_number,
        currency: data.currency,
        type: data.type,
        createdTime: new Date(),
        updatedTime: new Date(),
      };
      bankTransactions.push(transaction);
    }
    return bankTransactions;
  }
}
