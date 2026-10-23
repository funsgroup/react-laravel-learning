<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');                                   // 会社名
            $table->string('contact_name')->nullable();              // 先方担当者名
            $table->string('email')->nullable();                     // メールアドレス
            $table->string('phone')->nullable();                     // 電話番号
            $table->string('address')->nullable();                   // 郵便番号/住所
            $table->string('status')->default('active');             // 顧客状態
            $table->text('memo')->nullable();                        // メモ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
