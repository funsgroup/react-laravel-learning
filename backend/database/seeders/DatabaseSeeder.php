<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;

class DatabaseSeeder extends Seeder
{

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. 管理者ユーザーの作成
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => '管理者',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. 担当者（スタッフ）ユーザーの作成
        $staff = User::updateOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => '担当スタッフ',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ]
        );

        // 3. サンプル顧客 3件の作成
        $customerA = Customer::updateOrCreate(
            ['name' => '株式会社サンプルA'],
            [
                'contact_name' => '山田 太郎',
                'email' => 'yamada@sample-a.co.jp',
                'phone' => '03-1234-5678',
                'address' => '東京都千代田区1-1-1',
                'status' => 'active',
                'memo' => '基幹案件の取引先',
            ]
        );

        $customerB = Customer::updateOrCreate(
            ['name' => '株式会社サンプルB'],
            [
                'contact_name' => '佐藤 次郎',
                'email' => 'sato@sample-b.co.jp',
                'phone' => '06-9876-5432',
                'address' => '大阪府大阪市北区2-2-2',
                'status' => 'active',
                'memo' => '新規Webサイト構築予定',
            ]
        );

        $customerC = Customer::updateOrCreate(
            ['name' => '合同会社サンプルC'],
            [
                'contact_name' => '鈴木 三郎',
                'email' => 'suzuki@sample-c.com',
                'phone' => '092-111-2222',
                'address' => '福岡県福岡市博多区3-3-3',
                'status' => 'inactive',
                'memo' => '過去に案件実績あり',
            ]
        );

        // 4. 案件の作成
        $project1 = Project::updateOrCreate(
            ['title' => '業務管理システム開発'],
            [
                'customer_id' => $customerA->id,
                'owner_id' => $staff->id,
                'amount' => 1200000,
                'status' => 'in_progress',
                'start_date' => now()->startOfMonth()->toDateString(),
                'due_date' => now()->addMonths(2)->endOfMonth()->toDateString(),
                'description' => 'ReactとLaravelを用いたシステム開発案件',
            ]
        );

        $project2 = Project::updateOrCreate(
            ['title' => 'コーポレートサイト改修'],
            [
                'customer_id' => $customerB->id,
                'owner_id' => $admin->id,
                'amount' => 450000,
                'status' => 'not_started',
                'start_date' => now()->addDays(3)->toDateString(),
                'due_date' => now()->addMonth()->toDateString(),
                'description' => 'レスポンシブ対応とSEO改善',
            ]
        );

        // 5. 期限間近のサンプルタスクの作成
        Task::updateOrCreate(
            ['title' => 'API仕様書の作成とレビュー'],
            [
                'project_id' => $project1->id,
                'assignee_id' => $staff->id,
                'due_date' => now()->addDays(2)->toDateString(),
                'status' => 'in_progress',
                'memo' => '至急確認して先方へ共有すること',
            ]
        );

        Task::updateOrCreate(
            ['title' => 'トップページのデザインモック作成'],
            [
                'project_id' => $project2->id,
                'assignee_id' => $admin->id,
                'due_date' => now()->addDays(5)->toDateString(),
                'status' => 'not_started',
                'memo' => 'Figmaで作成してクライアント確認を行う',
            ]
        );
    }
}
