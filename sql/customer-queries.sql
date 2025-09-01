-- =================================================================
-- 顧客情報取得SQLクエリ集
-- データベース: stampless_backend (MySQL)
-- 用途: CS問い合わせ対応での顧客情報確認
-- =================================================================

-- -----------------------------------------------------------------
-- 1. 基本的な顧客情報取得（会社名での検索）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    o.created_at as office_created_at,
    o.updated_at as office_updated_at,
    abm.corporate_number,
    abm.partner_name_enc,
    abm.partner_email_enc,
    abm.partner_company_name_enc,
    abm.locale
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.name LIKE '%マネーフォワード%'
ORDER BY o.created_at DESC;

-- -----------------------------------------------------------------
-- 2. 複数条件での顧客検索（会社名・ID・UIDなど）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    o.created_at,
    abm.corporate_number,
    COUNT(abm.id) as address_book_count
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.name LIKE '%検索したい会社名%' OR 
    o.id = 12345 OR  -- office_id
    o.tenant_uid = 67890 OR  -- tenant_uid
    o.identification_code = 'MF123' OR  -- identification_code
    abm.corporate_number = '1234567890123'  -- 事業者番号
GROUP BY o.id, o.tenant_uid, o.name, o.identification_code, o.created_at, abm.corporate_number
ORDER BY o.created_at DESC
LIMIT 10;

-- -----------------------------------------------------------------
-- 3. 詳細な顧客情報（ユーザー情報含む）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    o.created_at as office_created_at,
    abm.corporate_number,
    u.id as user_id,
    u.email as user_email,
    u.name as user_name,
    u.created_at as user_created_at,
    COUNT(abm.id) as address_book_entries
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
LEFT JOIN users u ON abm.user_id = u.id
WHERE 
    o.name LIKE '%検索したい会社名%'
GROUP BY 
    o.id, o.tenant_uid, o.name, o.identification_code, o.created_at,
    abm.corporate_number, u.id, u.email, u.name, u.created_at
ORDER BY o.created_at DESC
LIMIT 20;

-- -----------------------------------------------------------------
-- 4. 最近活動のある顧客一覧（よく問い合わせがある顧客特定用）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    abm.corporate_number,
    o.created_at,
    o.updated_at,
    DATEDIFF(NOW(), o.updated_at) as days_since_update,
    COUNT(abm.id) as address_book_count
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)  -- 30日以内の更新
GROUP BY 
    o.id, o.tenant_uid, o.name, o.identification_code, 
    abm.corporate_number, o.created_at, o.updated_at
HAVING COUNT(abm.id) > 0  -- address_book_mastersにエントリがある
ORDER BY o.updated_at DESC
LIMIT 50;

-- -----------------------------------------------------------------
-- 5. 事業者番号での逆引き検索
-- -----------------------------------------------------------------
SELECT 
    abm.corporate_number,
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    abm.partner_company_name_enc,
    o.created_at
FROM address_book_masters abm
JOIN navis_offices o ON abm.navis_office_id = o.id
WHERE 
    abm.corporate_number = '1234567890123'  -- 事業者番号で検索
ORDER BY o.created_at DESC;

-- -----------------------------------------------------------------
-- 6. tenant_uidでの詳細検索（ERPWeb連携用）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    o.identification_code,
    o.created_at,
    abm.corporate_number,
    abm.locale,
    CONCAT('https://aweb.moneyforward.com/offices/', o.id) as aweb_url,
    CONCAT('https://erp.moneyforward.com/search?tenant_uid=', o.tenant_uid) as erp_url
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.tenant_uid = 67890  -- tenant_uidで検索
ORDER BY o.created_at DESC;

-- -----------------------------------------------------------------
-- 7. 顧客情報のエクスポート用クエリ（CSV出力向け）
-- -----------------------------------------------------------------
SELECT 
    o.id as 'Office ID',
    o.tenant_uid as 'Tenant UID',
    o.name as '事業者名',
    o.identification_code as '識別コード',
    abm.corporate_number as '事業者番号',
    DATE_FORMAT(o.created_at, '%Y-%m-%d') as '登録日',
    CASE 
        WHEN abm.locale = 'ja' THEN '日本語'
        WHEN abm.locale = 'en' THEN '英語'
        ELSE abm.locale
    END as '言語設定',
    CONCAT('https://aweb.moneyforward.com/offices/', o.id) as 'Aweb URL',
    CONCAT('https://erp.moneyforward.com/search?tenant_uid=', o.tenant_uid) as 'ERPWeb URL'
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)  -- 6ヶ月以内の顧客
ORDER BY o.created_at DESC;

-- -----------------------------------------------------------------
-- 8. 問い合わせ頻度の高い顧客特定（office更新頻度ベース）
-- -----------------------------------------------------------------
SELECT 
    o.id as office_id,
    o.tenant_uid,
    o.name as company_name,
    abm.corporate_number,
    o.created_at,
    o.updated_at,
    DATEDIFF(o.updated_at, o.created_at) as days_active,
    CASE 
        WHEN DATEDIFF(NOW(), o.updated_at) <= 7 THEN '高頻度'
        WHEN DATEDIFF(NOW(), o.updated_at) <= 30 THEN '中頻度'
        ELSE '低頻度'
    END as activity_level
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id
WHERE 
    o.updated_at != o.created_at  -- 作成後に更新があった顧客
ORDER BY o.updated_at DESC
LIMIT 100;

-- -----------------------------------------------------------------
-- 9. 暗号化フィールドの確認用クエリ（開発・デバッグ用）
-- -----------------------------------------------------------------
SELECT 
    abm.id,
    abm.navis_office_id,
    o.name as office_name,
    abm.corporate_number,
    LENGTH(abm.partner_name_enc) as name_enc_length,
    LENGTH(abm.partner_email_enc) as email_enc_length,
    LENGTH(abm.partner_company_name_enc) as company_enc_length,
    abm.locale,
    abm.created_at
FROM address_book_masters abm
JOIN navis_offices o ON abm.navis_office_id = o.id
WHERE 
    abm.corporate_number IS NOT NULL
ORDER BY abm.created_at DESC
LIMIT 20;

-- -----------------------------------------------------------------
-- 10. 統計情報取得クエリ
-- -----------------------------------------------------------------
SELECT 
    COUNT(DISTINCT o.id) as total_offices,
    COUNT(DISTINCT o.tenant_uid) as total_tenant_uids,
    COUNT(DISTINCT abm.corporate_number) as total_corporate_numbers,
    COUNT(abm.id) as total_address_book_entries,
    MIN(o.created_at) as oldest_office,
    MAX(o.created_at) as newest_office
FROM navis_offices o 
LEFT JOIN address_book_masters abm ON o.id = abm.navis_office_id;

-- =================================================================
-- 使用例とTips
-- =================================================================

/*
使用例1: 会社名での検索
WHERE o.name LIKE '%マネーフォワード%'

使用例2: office_idでの検索  
WHERE o.id = 12345

使用例3: tenant_uidでの検索
WHERE o.tenant_uid = 67890

使用例4: 事業者番号での検索
WHERE abm.corporate_number = '1234567890123'

使用例5: 部分一致検索
WHERE o.name LIKE '%株式会社%' OR o.name LIKE '%サンプル%'

パフォーマンスTips:
- office_idとtenant_uidにはインデックスが張られている
- LIKE検索は前方一致（'ABC%'）が高速
- 暗号化フィールド（*_enc）は復号化が必要な場合がある
- 大量データの場合はLIMITを使用
*/
