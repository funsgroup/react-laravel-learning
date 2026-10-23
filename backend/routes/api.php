<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ログイン前に呼べる API です。
Route::post('/login', [AuthController::class, 'login']);

// auth:sanctum の中は、ログイン済みユーザーだけが呼べます。
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
});