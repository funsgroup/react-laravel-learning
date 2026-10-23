<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    /**
     * 顧客一覧を取得します。
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Customer::latest()->get(),
        ]);
    }

    /**
     * 顧客を新規登録します。
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'data' => $customer,
        ], 201);
    }

    /**
     * 顧客情報を更新します。
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'data' => $customer->load('projects'),
        ]);
    }

    /**
     * 顧客情報を更新します。
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return response()->json([
            'data' => $customer,
        ]);
    }

    /**
     * 顧客を削除します。
     * 削除は影響が大きいため、admin 権限のユーザーだけ許可します。
     */
    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        abort_unless($request->user()?->role === 'admin', 403, '管理者のみ削除できます。');

        $customer->delete();

        return response()->json([
            'message' => '顧客を削除しました。',
        ]);
    }
}
