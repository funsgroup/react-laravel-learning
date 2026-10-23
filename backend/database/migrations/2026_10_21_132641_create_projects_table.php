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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();                 // カスタマーID (顧客削除時連動削除)
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();   // 担当者ID (ユーザー削除時null)
            $table->string('title');                                                           // 案件名
            $table->decimal('amount', 12, 2)->default(0);                                      // 金額
            $table->string('status')->default('not_started');                                  // 案件状態
            $table->date('start_date')->nullable();                                            // 開始日
            $table->date('due_date')->nullable();                                              // 期限
            $table->text('description')->nullable();                                           // 内容
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
