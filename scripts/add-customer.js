#!/usr/bin/env node

/**
 * 顧客データベース追加ツール
 * Awebで手動確認した情報を簡単に登録
 * 使用方法: node add-customer.js --name "会社名" --tenant_uid "67890" --office_id "12345"
 */

const fs = require('fs');
const path = require('path');

const CUSTOMER_DATABASE_FILE = path.join(__dirname, '../data/customer-database.json');

/**
 * コマンドライン引数解析
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value) {
      params[key] = value;
    }
  }
  
  return params;
}

/**
 * データベース読み込み
 */
function loadDatabase() {
  if (!fs.existsSync(CUSTOMER_DATABASE_FILE)) {
    return { customers: [], last_updated: null, data_sources: [], update_instructions: [] };
  }
  
  return JSON.parse(fs.readFileSync(CUSTOMER_DATABASE_FILE, 'utf8'));
}

/**
 * データベース保存
 */
function saveDatabase(database) {
  const dataDir = path.dirname(CUSTOMER_DATABASE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  database.last_updated = new Date().toISOString();
  fs.writeFileSync(CUSTOMER_DATABASE_FILE, JSON.stringify(database, null, 2));
}

/**
 * 顧客追加
 */
function addCustomer(params) {
  // 必須パラメータチェック
  const required = ['name', 'tenant_uid', 'office_id'];
  const missing = required.filter(key => !params[key]);
  
  if (missing.length > 0) {
    console.error(`❌ 必須パラメータが不足しています: ${missing.join(', ')}`);
    showUsage();
    process.exit(1);
  }
  
  const database = loadDatabase();
  
  // 重複チェック
  const existing = database.customers.find(c => 
    c.company_name === params.name ||
    c.tenant_uid === params.tenant_uid ||
    c.office_id === params.office_id
  );
  
  if (existing) {
    console.log(`⚠️ 既存の顧客が見つかりました: ${existing.company_name}`);
    console.log('更新しますか？ (y/N)');
    
    // 簡易的な更新処理
    const customer = {
      company_name: params.name,
      tenant_uid: params.tenant_uid,
      office_id: params.office_id,
      corporate_number: params.corporate_number || existing.corporate_number || '未登録',
      identification_code: params.identification_code || existing.identification_code || '未設定',
      plan_name: params.plan || existing.plan_name || '要確認',
      payment_method: params.payment || existing.payment_method || '要確認',
      created_at: params.created_at || existing.created_at || new Date().toISOString().split('T')[0],
      aweb_url: `https://aweb.moneyforward.com/offices/${params.office_id}`,
      erp_url: `https://erp.moneyforward.com/search?tenant_uid=${params.tenant_uid}`,
      notes: params.notes || existing.notes || '',
      updated_at: new Date().toISOString()
    };
    
    // 既存顧客を更新
    const index = database.customers.findIndex(c => 
      c.company_name === existing.company_name ||
      c.tenant_uid === existing.tenant_uid ||
      c.office_id === existing.office_id
    );
    
    database.customers[index] = customer;
    
  } else {
    // 新規顧客追加
    const customer = {
      company_name: params.name,
      tenant_uid: params.tenant_uid,
      office_id: params.office_id,
      corporate_number: params.corporate_number || '未登録',
      identification_code: params.identification_code || '未設定',
      plan_name: params.plan || '要確認',
      payment_method: params.payment || '要確認',
      created_at: params.created_at || new Date().toISOString().split('T')[0],
      aweb_url: `https://aweb.moneyforward.com/offices/${params.office_id}`,
      erp_url: `https://erp.moneyforward.com/search?tenant_uid=${params.tenant_uid}`,
      notes: params.notes || '',
      added_at: new Date().toISOString()
    };
    
    database.customers.push(customer);
  }
  
  // データベース保存
  saveDatabase(database);
  
  console.log('✅ 顧客情報を登録しました！');
  console.log(`📊 現在の登録顧客数: ${database.customers.length}件`);
  console.log(`🔍 テスト検索: node scripts/customer-lookup-aweb-scraping.js "${params.name}"`);
}

/**
 * 使用方法表示
 */
function showUsage() {
  console.log(`
📊 顧客データベース追加ツール

使用方法:
  node add-customer.js --name "会社名" --tenant_uid "67890" --office_id "12345" [オプション]

必須パラメータ:
  --name          会社名（例: "株式会社サンプル"）
  --tenant_uid    Tenant UID（例: "67890"）
  --office_id     Office ID（例: "12345"）

オプションパラメータ:
  --corporate_number      事業者番号（例: "1234567890123"）
  --identification_code   識別コード（例: "SAMPLE001"）
  --plan                  プラン名（例: "Midプラン"）
  --payment               支払い方法（例: "クレジットカード"）
  --created_at            登録日（例: "2023-01-15"）
  --notes                 メモ（例: "よく問い合わせがある顧客"）

実行例:
  # 最小限の情報で登録
  node add-customer.js \\
    --name "株式会社サンプル" \\
    --tenant_uid "11111" \\
    --office_id "99999"

  # 全情報を指定して登録
  node add-customer.js \\
    --name "株式会社サンプル" \\
    --tenant_uid "11111" \\
    --office_id "99999" \\
    --corporate_number "9876543210987" \\
    --identification_code "SAMPLE001" \\
    --plan "Basicプラン" \\
    --payment "銀行振込" \\
    --notes "テスト用データ"

💡 Tip: 
- Awebで確認した情報をそのまま入力
- 支払い方法が不明な場合は後で ERPWeb で確認
- 一度登録すれば次回以降は完全自動取得
  `);
}

/**
 * メイン処理
 */
function main() {
  const params = parseArgs();
  
  if (Object.keys(params).length === 0 || params.help || params.h) {
    showUsage();
    process.exit(0);
  }
  
  addCustomer(params);
}

// スクリプト実行
if (require.main === module) {
  main();
}
