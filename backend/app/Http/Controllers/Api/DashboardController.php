<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * ダッシュボード用の集計サマリーデータを返します。
     */
    public function summary(): JsonResponse
    {
        // 1. 各種カウント
        $counts = [
            'customers' => Customer::count(),
            'projects' => project::count(),
            'open_tasks' => Task::where('status', '!=', 'done')->count(),
        ];

        // 2. 案件ステータスごとの集計
        $projectStatuses = Project::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // 3. 期限切れを含む、期限が7日以内で未完了のタスク（最大5件）
        $upcomingTasks = Task::with('project')
            ->where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->where('due_date', '<=', now()->addDays(7)->toDateString())
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'counts' => $counts,
                'project_statuses' => $projectStatuses,
                'upcoming_tasks' => $upcomingTasks,
            ],
        ]);
    }
}
