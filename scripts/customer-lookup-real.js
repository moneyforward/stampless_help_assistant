#!/usr/bin/env node

/**
 * 実際の業務用 顧客情報自動取得スクリプト
 * 使用方法: node customer-lookup-real.js "株式会社サンプル"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 設定ファイルから接続情報を読み込み
const CONFIG_FILE = path.join(__dirname, '../config/database-config.json');

/**
 * 設定ファイルの読み込み
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ 設定ファイルが見つかりません:', CONFIG_FILE);
    console.log('\n📋 設定ファイルを作成してください:');
    console.log('mkdir -p config');
    console.log('cp config/database-config.example.json config/database-config.json');
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
      host: config.stampless_db.host,
      user: config.stampless_db.user,
      password: config.stampless_db.password,
      database: config.stampless_db.database,
      port: config.stampless_db.port || 3306
    });

    // 会社名から顧客情報を検索
    const [rows] = await connection.execute(`
      SELECT 
        o.id as office_id,
        o.tenant_uid,
        o.name as company_name,
        o.identification_code,
        abm.corporate_number
      FROM navis_offices o 
      LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
      WHERE 
        o.name LIKE ? OR 
        o.id = ? OR 
        o.tenant_uid = ? OR
        o.identification_code = ? OR
        abm.corporate_number = ?
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
    return null;
  }
}

/**
 * ERPWeb API から支払い情報を取得
 */
async function queryERPWebAPI(tenantUID, config) {
  return new Promise((resolve) => {
    const options = {
      hostname: config.erpweb_api.host,
      port: config.erpweb_api.port || 443,
      path: `/api/contracts/${tenantUID}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.erpweb_api.username}:${config.erpweb_api.password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            plan_name: result.plan_name || '不明',
            payment_method: result.payment_method || '不明',
            contract_status: result.status || '不明'
          });
        } catch (e) {
          console.warn('⚠️ ERPWeb API レスポンス解析エラー');
          resolve({
            plan_name: '要確認',
            payment_method: '要確認', 
            contract_status: '要確認'
          });
        }
      });
    });

    req.on('error', (error) => {
      console.warn('⚠️ ERPWeb API接続エラー:', error.message);
      resolve({
        plan_name: '要確認',
        payment_method: '要確認',
        contract_status: '要確認'
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        plan_name: 'タイムアウト',
        payment_method: 'タイムアウト',
        contract_status: 'タイムアウト'
      });
    });

    req.end();
  });
}

/**
 * 顧客情報テンプレート生成（実データ版）
 */
function generateRealCustomerInfoTemplate(basicInfo, paymentInfo, originalQuery) {
  if (!basicInfo) {
    return `# ❌ 顧客情報取得エラー

## 検索クエリ
- **入力値**: ${originalQuery}
- **検索結果**: 該当する顧客が見つかりませんでした

## 🔍 確認事項
- [ ] 会社名のスペルミスがないか確認
- [ ] office_id、tenant_uid が正確か確認
- [ ] 顧客がシステムに登録済みか確認

## 🔗 手動確認リンク
- [Aweb検索](https://aweb.moneyforward.com/search?q=${encodeURIComponent(originalQuery)})
- [ERPWeb検索](https://erp.moneyforward.com/search?q=${encodeURIComponent(originalQuery)})

## 📞 エスカレーション
実際の顧客情報が見つからない場合は、CS責任者に確認してください。
`;
  }

  return `# 🏢 顧客情報 - ${basicInfo.company_name}

## 📋 基本情報（自動取得済み）
- **事業者名**: ${basicInfo.company_name}
- **事業者No (tenant_uid)**: ${basicInfo.tenant_uid}
- **Office ID**: ${basicInfo.office_id}
- **事業者番号**: ${basicInfo.corporate_number || '未登録'}
- **識別コード**: ${basicInfo.identification_code || '未設定'}

## 💳 契約・支払い情報（自動取得済み）
- **プラン名**: ${paymentInfo.plan_name}
- **支払い方法**: ${paymentInfo.payment_method}
- **契約状況**: ${paymentInfo.contract_status}

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

## ✅ 情報取得完了
- [x] 事業者名確認完了: ${basicInfo.company_name}
- [x] 事業者No確認完了: ${basicInfo.tenant_uid}
- [x] 支払い方法確認完了: ${paymentInfo.payment_method}
- [x] プラン確認完了: ${paymentInfo.plan_name}
- [ ] 問い合わせ内容の分析
- [ ] 不具合報告テンプレートの完成

**次のステップ**: この情報を使って help_request_assistant ルールを実行してください。
`;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 実業務用 顧客情報取得ツール

使用方法:
  node customer-lookup-real.js "会社名"
  node customer-lookup-real.js "12345"  (office_id)
  node customer-lookup-real.js "67890"  (tenant_uid)

例:
  node customer-lookup-real.js "株式会社マネーフォワード"
  node customer-lookup-real.js "12345"

⚠️ 事前準備:
  1. config/database-config.json を設定
  2. mysql2 パッケージをインストール: npm install mysql2
    `);
    process.exit(1);
  }
  
  const query = args[0];
  console.log(`🔍 実データベースから顧客情報を検索中... (クエリ: "${query}")\n`);
  
  // 設定読み込み
  const config = loadConfig();
  
  // 基本情報取得（stampless_backend DB）
  const basicInfo = await queryStamplessDB(query, config);
  
  // 支払い情報取得（ERPWeb API）
  let paymentInfo = { plan_name: '要確認', payment_method: '要確認', contract_status: '要確認' };
  if (basicInfo && basicInfo.tenant_uid) {
    paymentInfo = await queryERPWebAPI(basicInfo.tenant_uid, config);
  }
  
  // テンプレート生成
  const template = generateRealCustomerInfoTemplate(basicInfo, paymentInfo, query);
  
  // 結果をファイルに保存
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `customer-info-real-${timestamp}.md`;
  const outputPath = path.join(outputDir, filename);
  
  fs.writeFileSync(outputPath, template);
  
  // コンソールに出力
  console.log(template);
  console.log(`\n📄 結果を保存しました: ${outputPath}`);
  
  if (basicInfo) {
    console.log('\n🎯 次のアクション:');
    console.log('1. この情報を確認してください');
    console.log('2. 問い合わせ内容を追加で入力してください');
    console.log('3. help_request_assistant ルールが自動実行されます');
  } else {
    console.log('\n❌ 顧客情報が見つからない場合:');
    console.log('1. 入力した会社名・IDが正確か確認');
    console.log('2. Awebで手動検索');
    console.log('3. CS責任者にエスカレーション');
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { queryStamplessDB, queryERPWebAPI, generateRealCustomerInfoTemplate };
