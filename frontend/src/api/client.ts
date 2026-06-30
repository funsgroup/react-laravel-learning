// Vite では import.meta.env から .env の値を読み取れます。
// 未設定の場合でも開発環境で動くように、Laravel API の標準 URL を既定値にしています。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/**
 * API からエラーが返ってきたときに使う専用 Error です。
 *
 * status には HTTP ステータスコード、errors には Laravel のバリデーションエラーが入ります。
 */
export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/**
 * ブラウザの Cookie から指定した名前の値を取り出します。
 *
 * Sanctum の CSRF トークンは XSRF-TOKEN という Cookie に入るため、
 * API リクエスト時にヘッダーへ付け直します。
 */
const readCookie = (name: string) => {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]

  return value ? decodeURIComponent(value) : ''
}

/**
 * API エラー時の JSON を読み取ります。
 *
 * サーバーが JSON を返せなかった場合でも、画面に表示できるメッセージを用意します。
 */
const parseErrorPayload = async (response: Response) => {
  try {
    return (await response.json()) as { message?: string; errors?: Record<string, string[]> }
  } catch {
    return { message: 'API の応答を読み取れませんでした。' }
  }
}

/**
 * Laravel API へリクエストを送る共通関数です。
 *
 * ここに共通処理をまとめることで、各画面のコードでは API パスと body だけを意識できます。
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined

  // Laravel API には JSON を返してほしいため、Accept ヘッダーを常に付けます。
  headers.set('Accept', 'application/json')

  // FormData 以外の body は JSON として送ります。
  if (hasBody && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Cookie の CSRF トークンを X-XSRF-TOKEN ヘッダーに入れると、Laravel が正当なリクエストとして扱います。
  const csrfToken = readCookie('XSRF-TOKEN')
  if (csrfToken) {
    headers.set('X-XSRF-TOKEN', csrfToken)
  }

  // credentials: 'include' により、ログイン状態を表す Cookie も一緒に送信します。
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const payload = await parseErrorPayload(response)
    throw new ApiError(payload.message ?? 'API リクエストに失敗しました。', response.status, payload.errors)
  }

  // 204 No Content は返す JSON がないため、undefined として扱います。
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

/**
 * Sanctum の CSRF Cookie を取得します。
 *
 * ログイン前に呼ぶことで、次の POST /api/login が CSRF チェックを通過できます。
 */
export const csrfCookie = async () => {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}
