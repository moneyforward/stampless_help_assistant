#!/usr/bin/env node

/**
 * SQL実行 & CSVエクスポートツール
 * stampless_backendのMySQLに接続してSQLクエリを実行し、結果をCSV出力
 * 使用方法: node sql-export.js --query "SELECT * FROM navis_offices LIMIT 10"
 */

const fs = require('fs');
const path = require('path');

// 設定ファイルから接続情報を読み込み
const CONFIG_FILE = path.join(__dirname, '../config/database-config-simple.json');

/**
 * 設定ファイルの読み込み
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ 設定ファイルが見つかりません:', CONFIG_FILE);
    console.log('\n📋 設定ファイルを作成してください:');
    console.log('cp config/database-config-simple.example.json config/database-config-simple.json');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

/**
 * SQLクエリ実行
 */
async function executeQuery(query, config) {
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port || 3306
    });

    console.log('🔗 データベースに接続しました');
    console.log(`📊 実行するクエリ:\n${query}\n`);
    
    const [rows, fields] = await connection.execute(query);
    
    await connection.end();
    
    console.log(`✅ クエリ実行完了: ${rows.length}件のレコードを取得`);
    
    return { rows, fields };
    
  } catch (error) {
    console.error('❌ データベースエラー:', error.message);
    console.log('\n🔧 対処法:');
    console.log('1. config/database-config-simple.json の設定を確認');
    console.log('2. VPN接続を確認');
    console.log('3. DB管理者に読み取り権限を依頼');
    console.log('4. SQLクエリの構文を確認');
    return null;
  }
}

/**
 * 結果をCSVファイルに出力
 */
function exportToCSV(rows, fields, filename) {
  if (!rows || rows.length === 0) {
    console.log('❌ 出力するデータがありません');
    return null;
  }
  
  // ヘッダー行作成
  const headers = fields.map(field => field.name);
  let csvContent = headers.join(',') + '\n';
  
  // データ行作成
  rows.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      
      // 値の処理
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'string') {
        // CSVエスケープ（カンマ、改行、ダブルクォート対応）
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
      } else if (value instanceof Date) {
        value = value.toISOString().split('T')[0]; // YYYY-MM-DD形式
      }
      
      return value;
    });
    
    csvContent += values.join(',') + '\n';
  });
  
  // ファイル出力
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log(`📄 CSVファイルを出力しました: ${outputPath}`);
  return outputPath;
}

/**
 * 結果をMarkdownテーブルで表示
 */
function displayAsTable(rows, fields, limit = 20) {
  if (!rows || rows.length === 0) {
    console.log('❌ 表示するデータがありません');
    return;
  }
  
  console.log('\n📋 クエリ結果プレビュー:');
  
  // ヘッダー
  const headers = fields.map(field => field.name);
  console.log('| ' + headers.join(' | ') + ' |');
  console.log('|' + headers.map(() => '---').join('|') + '|');
  
  // データ行（制限あり）
  const displayRows = rows.slice(0, limit);
  displayRows.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) {
        return 'NULL';
      } else if (typeof value === 'string' && value.length > 30) {
        return value.substring(0, 27) + '...';
      } else if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      return String(value);
    });
    console.log('| ' + values.join(' | ') + ' |');
  });
  
  if (rows.length > limit) {
    console.log(`\n... and ${rows.length - limit} more rows (see CSV file for all data)`);
  }
}

/**
 * 事前定義クエリの実行
 */
function getPredefinedQuery(queryName) {
  const queries = {
    'customers': `
      SELECT 
        o.id as office_id,
        o.tenant_uid,
        o.name as company_name,
        o.identification_code,
        abm.corporate_number,
        DATE_FORMAT(o.created_at, '%Y-%m-%d') as created_date
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
      ORDER BY o.created_at DESC
      LIMIT 100
    `,
    
    'recent': `
      SELECT 
        o.id as office_id,
        o.tenant_uid,
        o.name as company_name,
        abm.corporate_number,
        DATE_FORMAT(o.updated_at, '%Y-%m-%d %H:%i') as last_updated
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
      WHERE o.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY o.updated_at DESC
    `,
    
    'stats': `
      SELECT 
        COUNT(DISTINCT o.id) as total_offices,
        COUNT(DISTINCT o.tenant_uid) as total_tenant_uids,
        COUNT(DISTINCT abm.corporate_number) as total_corporate_numbers,
        MIN(DATE_FORMAT(o.created_at, '%Y-%m-%d')) as oldest_office,
        MAX(DATE_FORMAT(o.created_at, '%Y-%m-%d')) as newest_office
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
    `,
    
    'search': `
      SELECT 
        o.id as office_id,
        o.tenant_uid,
        o.name as company_name,
        o.identification_code,
        abm.corporate_number,
        CONCAT('https://aweb.moneyforward.com/offices/', o.id) as aweb_url
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
      WHERE o.name LIKE '%マネーフォワード%'
      ORDER BY o.created_at DESC
    `
  };
  
  return queries[queryName] || null;
}

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
 * 使用方法表示
 */
function showUsage() {
  console.log(`
📊 SQL実行 & CSVエクスポートツール

使用方法:
  node sql-export.js --query "SELECT文" [--output ファイル名] [--limit 表示件数]

事前定義クエリ:
  node sql-export.js --preset customers    # 顧客一覧(100件)
  node sql-export.js --preset recent       # 最近更新された顧客
  node sql-export.js --preset stats        # 統計情報
  node sql-export.js --preset search       # マネーフォワード顧客検索

カスタムクエリ例:
  # 特定の会社を検索
  node sql-export.js --query "SELECT o.id, o.name, o.tenant_uid FROM navis_offices o WHERE o.name LIKE '%サンプル%'"
  
  # tenant_uidで検索
  node sql-export.js --query "SELECT * FROM navis_offices WHERE tenant_uid = 67890"
  
  # 事業者番号で検索
  node sql-export.js --query "SELECT o.*, abm.corporate_number FROM navis_offices o JOIN address_book_masters abm ON o.id = abm.navis_office_id WHERE abm.corporate_number = '1234567890123'"

オプション:
  --query     実行するSQLクエリ
  --preset    事前定義クエリ名 (customers, recent, stats, search)
  --output    出力CSVファイル名 (デフォルト: query-result-TIMESTAMP.csv)
  --limit     テーブル表示件数 (デフォルト: 20件)

⚠️ 注意:
- SELECT文のみ使用可能（INSERT/UPDATE/DELETE不可）
- 大量データの場合はLIMITを使用推奨
- 暗号化フィールド(*_enc)は復号化されません
  `);
}

/**
 * メイン処理
 */
async function main() {
  const params = parseArgs();
  
  if (Object.keys(params).length === 0 || params.help || params.h) {
    showUsage();
    process.exit(0);
  }
  
  // クエリの決定
  let query;
  if (params.preset) {
    query = getPredefinedQuery(params.preset);
    if (!query) {
      console.error(`❌ 不明な事前定義クエリ: ${params.preset}`);
      console.log('利用可能: customers, recent, stats, search');
      process.exit(1);
    }
    console.log(`🔍 事前定義クエリを実行: ${params.preset}`);
  } else if (params.query) {
    query = params.query;
    
    // 安全性チェック（SELECT文のみ許可）
    const upperQuery = query.trim().toUpperCase();
    if (!upperQuery.startsWith('SELECT')) {
      console.error('❌ SELECT文のみ使用可能です');
      process.exit(1);
    }
    
    if (upperQuery.includes('INSERT') || upperQuery.includes('UPDATE') || upperQuery.includes('DELETE') || upperQuery.includes('DROP')) {
      console.error('❌ データ変更クエリは使用できません');
      process.exit(1);
    }
  } else {
    console.error('❌ --query または --preset を指定してください');
    showUsage();
    process.exit(1);
  }
  
  // 設定読み込み
  const config = loadConfig();
  
  // クエリ実行
  const result = await executeQuery(query, config);
  if (!result) {
    process.exit(1);
  }
  
  const { rows, fields } = result;
  
  // テーブル表示
  const displayLimit = parseInt(params.limit) || 20;
  displayAsTable(rows, fields, displayLimit);
  
  // CSV出力
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultFilename = `query-result-${timestamp}.csv`;
  const filename = params.output || defaultFilename;
  
  exportToCSV(rows, fields, filename);
  
  console.log('\n✅ 処理完了');
  console.log(`📊 取得件数: ${rows.length}件`);
  console.log(`📄 CSVファイル: output/${filename}`);
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  });
}

module.exports = { executeQuery, exportToCSV };
