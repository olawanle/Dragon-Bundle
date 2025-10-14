import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './database.sqlite') {
    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Shops table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS shops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        scope TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bundles table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bundles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value REAL NOT NULL,
        items TEXT NOT NULL, -- JSON string of bundle items
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_domain) REFERENCES shops (shop_domain)
      )
    `);

    // Bundle analytics table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bundle_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bundle_id INTEGER NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('view', 'add_to_cart', 'checkout')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bundle_id) REFERENCES bundles (id)
      )
    `);
  }

  // Promisified database methods
  public run = promisify(this.db.run.bind(this.db));
  public get = promisify(this.db.get.bind(this.db));
  public all = promisify(this.db.all.bind(this.db));

  public close() {
    this.db.close();
  }
}

export const database = new Database();

