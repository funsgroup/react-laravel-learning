# Laravel API を動かすための PHP コンテナです。
# `php:8.4-cli` は PHP コマンドを実行できる軽量な公式イメージです。
FROM php:8.4-cli

# Laravel の依存関係をインストールするための OS パッケージと PHP 拡張を追加します。
# pdo_mysql は MySQL 接続、zip は Composer パッケージの展開で使います。
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev default-mysql-client \
    && docker-php-ext-install pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

# Composer は PHP の依存パッケージ管理ツールです。
# 公式 Composer イメージから実行ファイルだけをコピーしています。
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 以降のコマンドを実行する基準ディレクトリです。
# docker-compose.yml で backend ディレクトリをここへマウントします。
WORKDIR /var/www/html
