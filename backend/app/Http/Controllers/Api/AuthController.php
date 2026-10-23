<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * メールアドレスとパスワードでログインします。
     *
     * React 側は先に /sanctum/csrf-cookie を呼び、CSRF Cookie を受け取ってから
     * この API を呼び出します。ログインに成功するとセッション Cookie が有効になります。
     */
    public function login(Request $request): JsonResponse
    {
        // まず入力値の形を確認します。失敗すると Laravel が 422 レスポンスを返します。
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // ここで users テーブルの email/password を照合します。
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['メールアドレスまたはパスワードが正しくありません。'],
            ]);
        }

        // ログイン直後にセッション ID を作り直し、安全性を高めます。
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        // セッションが有効な場合のみ無効化・再生成を実行
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * ログイン中のユーザー情報を返します。
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
