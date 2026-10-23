<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * 案件一覧を取得します。
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Project::with(['customer', 'owner'])->latest()->get(),
        ]);
    }

    /**
     * 案件を新規登録します。
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $project = Project::create($validated);

        return response()->json([
            'data' => $project,
        ], 201);
    }

    /**
     * 案件詳細を取得します。
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'data' => $project->load(['customer', 'owner', 'tasks']),
        ]);
    }

    /**
     * 案件情報を更新します。
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $project->update($validated);

        return response()->json([
            'data' => $project,
        ]);
    }

    /**
     * 案件を削除します。
     * admin 権限のユーザーだけ許可します。
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        abort_unless($request->user()?->role === 'admin', 403, '管理者のみ削除できます。');

        $project->delete();

        return response()->json([
            'message' => '案件を削除しました。',
        ]);
    }
}
