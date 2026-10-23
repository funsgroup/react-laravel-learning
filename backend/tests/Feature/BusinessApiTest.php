<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BusinessApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_apis(): void
    {
        // 未ログイン時は 401 Unauthorized になる
        $this->getJson('/api/customers')->assertStatus(401);
        $this->getJson('/api/dashboard/summary')->assertStatus(401);
    }

    public function test_can_perform_business_data_crud(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        // 顧客作成
        $customerRes = $this->postJson('/api/customers', [
            'name' => 'テスト株式会社',
            'status' => 'active',
        ]);
        $customerRes->assertStatus(201);
        $customerId = $customerRes->json('data.id');

        // 案件作成
        $projectRes = $this->postJson('/api/projects', [
            'customer_id' => $customerId,
            'title' => '新規開発案件',
            'status' => 'in_progress',
        ]);
        $projectRes->assertStatus(201);
        $projectId = $projectRes->json('data.id');

        // タスク作成
        $taskRes = $this->postJson('/api/tasks', [
            'project_id' => $projectId,
            'title' => '要件定義',
            'status' => 'not_started',
        ]);
        $taskRes->assertStatus(201);
    }

    public function test_staff_cannot_delete_customer(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $customer = Customer::create([
            'name' => '削除テスト用会社A',
            'status' => 'active',
        ]);

        Sanctum::actingAs($staff);

        // staff は削除できない（403 Forbidden）
        $response = $this->deleteJson("/api/customers/{$customer->id}");
        $response->assertStatus(403);
    }

    public function test_admin_can_delete_customer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = Customer::create([
            'name' => '削除テスト用会社B',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        // admin は削除できる
        $response = $this->deleteJson("/api/customers/{$customer->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_dashboard_summary_returns_expected_structure(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/summary');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'counts' => ['customers', 'projects', 'open_tasks'],
                    'project_statuses',
                    'upcoming_tasks',
                ],
            ]);
    }
}
