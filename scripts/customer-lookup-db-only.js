#!/usr/bin/env node

/**
 * 代替案1: stampless_backend DBのみ接続版
 * ERPWeb依頼不要で基本情報のみ自動取得
 * 使用方法: node customer-lookup-db-only.js "株式会社サンプル"
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
 * stampless_backend の MySQL DB から顧客情報を取得
 */
async function queryStamplessDB(query, config) {
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port || 3306
    });

    // 会社名から顧客情報を検索
    const [rows] = await connection.execute(`
      SELECT 
        o.id as office_id,
        o.tenant_uid,
        o.name as company_name,
        o.identification_code,
        o.created_at,
        abm.corporate_number
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
      WHERE 
        o.name LIKE ? OR 
        o.id = ? OR 
        o.tenant_uid = ? OR
        o.identification_code = ? OR
        abm.corporate_number = ?
      ORDER BY o.created_at DESC
      LIMIT 1
    `, [
      `%${query}%`,  // 会社名での部分一致
      isNaN(query) ? null : parseInt(query),  // office_id
      isNaN(query) ? null : parseInt(query),  // tenant_uid  
      query,  // identification_code
      query   // corporate_number
    ]);

    await connection.end();
    return rows[0] || null;
    
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message);
    console.log('\n🔧 対処法:');
    console.log('1. config/database-config-simple.json の設定を確認');
    console.log('2. VPN接続を確認');
    console.log('3. DB管理者に読み取り権限を依頼');
    return null;
  }
}

/**
 * 顧客情報テンプレート生成（DB接続のみ版）
 */
function generateDbOnlyTemplate(basicInfo, originalQuery) {
  if (!basicInfo) {
    return `# ❌ 顧客情報取得エラー

## 検索クエリ
- **入力値**: ${originalQuery}
- **検索結果**: 該当する顧客が見つかりませんでした

## 🔍 確認事項
- [ ] 会社名のスペルミスがないか確認
- [ ] office_id、tenant_uid が正確か確認
- [ ] 顧客がシステムに登録済みか確認
- [ ] データベース接続設定を確認

## 🔗 手動確認リンク
- [Aweb検索](https://aweb.moneyforward.com/search?q=${encodeURIComponent(originalQuery)})
- [ERPWeb検索](https://erp.moneyforward.com/search?tenant_uid=${originalQuery})

## 📞 エスカレーション
実際の顧客情報が見つからない場合は、CS責任者に確認してください。
`;
  }

  return `# 🏢 顧客情報 - ${basicInfo.company_name}

## 📋 基本情報（自動取得済み ✅）
- **事業者名**: ${basicInfo.company_name}
- **事業者No (tenant_uid)**: ${basicInfo.tenant_uid}
- **Office ID**: ${basicInfo.office_id}
- **事業者番号**: ${basicInfo.corporate_number || '未登録'}
- **識別コード**: ${basicInfo.identification_code || '未設定'}
- **登録日**: ${new Date(basicInfo.created_at).toLocaleDateString('ja-JP')}

## 💳 契約・支払い情報（手動確認）
- **プラン名**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=${basicInfo.tenant_uid})
- **支払い方法**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=${basicInfo.tenant_uid})
- **契約状況**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=${basicInfo.tenant_uid})

## 🔗 詳細確認リンク
- [Aweb詳細画面](https://aweb.moneyforward.com/offices/${basicInfo.office_id})
- [ERPWeb契約情報](https://erp.moneyforward.com/search?tenant_uid=${basicInfo.tenant_uid})

---

## 📝 不具合報告テンプレート（自動入力済み）

	•	不具合レベル: {{レベル1〜4}}
	•	事業者名: ${basicInfo.company_name}
	•	事業者No: ${basicInfo.tenant_uid}
	•	Office ID: ${basicInfo.office_id}
	•	不具合が発生したUID/Affected UID: {{ユーザーID（任意）}}
	•	該当の書類番号/Affected document ID: {{任意}}
	•	事象（起きていたこと）/What happened: {{What happened}}
	•	正しい挙動（こうなるはず）/Expected behavior: {{What should have happened}}
	•	事象によるユーザーへの影響/Impacts (任意): {{影響ユーザー数・頻度・業務影響など}}
	•	障害発生時間/Time when it occurred: {{yyyy-mm-dd hh:mm}}

---

## ✅ 情報取得状況
- [x] 事業者名確認完了: ${basicInfo.company_name}
- [x] 事業者No確認完了: ${basicInfo.tenant_uid}
- [x] Office ID確認完了: ${basicInfo.office_id}
- [ ] 支払い方法確認（ERPWebリンクをクリック）
- [ ] プラン確認（ERPWebリンクをクリック）
- [ ] 問い合わせ内容の分析
- [ ] 不具合報告テンプレートの完成

**次のステップ**: 
1. ERPWebリンクで支払い情報を確認
2. この情報を使って help_request_assistant ルールを実行
`;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 stampless_backend DB接続版 顧客情報取得ツール

使用方法:
  node customer-lookup-db-only.js "会社名"
  node customer-lookup-db-only.js "12345"  (office_id)
  node customer-lookup-db-only.js "67890"  (tenant_uid)

例:
  node customer-lookup-db-only.js "株式会社マネーフォワード"
  node customer-lookup-db-only.js "12345"

⚠️ 事前準備:
  1. config/database-config-simple.json を設定
  2. mysql2 パッケージをインストール: npm install mysql2
  3. stampless_backend DBへの読み取り権限を取得

✅ メリット:
  - ERPWeb権限不要
  - 基本情報（事業者名、ID等）は自動取得
  - 支払い情報は手動リンクで簡単確認
    `);
    process.exit(1);
  }
  
  const query = args[0];
  console.log(`🔍 stampless_backend DBから顧客情報を検索中... (クエリ: "${query}")\n`);
  
  // 設定読み込み
  const config = loadConfig();
  
  // 基本情報取得（stampless_backend DB）
  const basicInfo = await queryStamplessDB(query, config);
  
  // テンプレート生成
  const template = generateDbOnlyTemplate(basicInfo, query);
  
  // 結果をファイルに保存
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `customer-info-db-only-${timestamp}.md`;
  const outputPath = path.join(outputDir, filename);
  
  fs.writeFileSync(outputPath, template);
  
  // コンソールに出力
  console.log(template);
  console.log(`\n📄 結果を保存しました: ${outputPath}`);
  
  if (basicInfo) {
    console.log('\n🎯 次のアクション:');
    console.log('1. ✅ 基本情報は自動取得済み');
    console.log('2. 🔗 ERPWebリンクで支払い情報を確認');
    console.log('3. 📝 問い合わせ内容を追加で入力');
    console.log('4. 🤖 help_request_assistant ルールが自動実行');
  } else {
    console.log('\n❌ 顧客情報が見つからない場合:');
    console.log('1. 入力した会社名・IDが正確か確認');
    console.log('2. データベース接続設定を確認');
    console.log('3. Awebで手動検索');
    console.log('4. CS責任者にエスカレーション');
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { queryStamplessDB, generateDbOnlyTemplate };
