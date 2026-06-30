-- Laravel のテスト専用データベースです。
-- 開発用の business_sample とは DB 名を分け、テストが普段のデータを触らないようにします。
CREATE DATABASE IF NOT EXISTS `business_sample_test`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- docker-compose.yml の MYSQL_USER で作られる app_user に、テスト DB への操作権限を付与します。
GRANT ALL PRIVILEGES ON `business_sample_test`.* TO 'app_user'@'%';
