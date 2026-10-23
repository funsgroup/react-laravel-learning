<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    /**
     * タスク一覧を取得します。
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Task::with(['project', 'assignee'])->latest()->get(),
        ]);
    }

    /**
     * タスクを新規登録します。
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
        ]);

        $task = Task::create($validated);

        return response()->json([
            'data' => $task,
        ], 201);
    }

    /**
     * タスク詳細を取得します。
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json([
            'data' => $task->load(['project', 'assignee']),
        ]);
    }

    /**
     * タスク情報を更新します。
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
        ]);

        $task->update($validated);

        return response()->json([
            'data' => $task,
        ]);
    }

    /**
     * タスクを削除します。
     * admin 権限のユーザーだけ許可します。
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        abort_unless($request->user()?->role === 'admin', 403, '管理者のみ削除できます。');

        $task->delete();

        return response()->json([
            'message' => 'タスクを削除しました。',
        ]);
    }
}
