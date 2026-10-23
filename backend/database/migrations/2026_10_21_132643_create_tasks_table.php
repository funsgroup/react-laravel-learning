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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();  // 案件ID (案件削除時連動削除)
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete(); // 担当者ID (ユーザー削除時null)
            $table->string('title');                                            // タスク名
            $table->date('due_date')->nullable();                               // 期限
            $table->string('status')->default('not_started');                   // タスク状態
            $table->text('memo')->nullable();                                   // メモ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
