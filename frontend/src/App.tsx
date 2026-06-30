import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { ApiError, apiRequest, csrfCookie } from './api/client'
import './App.css'
import type {
  ApiItem,
  ApiList,
  AuthResponse,
  Customer,
  CustomerStatus,
  DashboardSummary,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  User,
} from './types'

// 画面左のナビゲーションで切り替えるタブ名です。
type Tab = 'dashboard' | 'customers' | 'projects' | 'tasks'

// フォームは input の value に入れやすいよう、基本的に文字列で持ちます。
// API へ送る直前に number や null へ変換します。
type CustomerForm = {
  name: string
  contact_name: string
  email: string
  phone: string
  address: string
  status: CustomerStatus
  memo: string
}

// select や date input は空文字を扱うため、DB の型とは少し違う形にしています。
type ProjectForm = {
  customer_id: string
  title: string
  amount: string
  status: ProjectStatus
  start_date: string
  due_date: string
  description: string
}

// タスク登録・編集フォームで使う値です。
type TaskForm = {
  project_id: string
  title: string
  due_date: string
  status: TaskStatus
  memo: string
}

// API や DB では英語の状態値を使い、画面では日本語ラベルに変換して表示します。
const customerStatusLabels: Record<CustomerStatus, string> = {
  prospect: '見込み',
  active: '取引中',
  inactive: '停止',
}

const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: '予定',
  in_progress: '進行中',
  completed: '完了',
  on_hold: '保留',
}

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '未着手',
  doing: '対応中',
  done: '完了',
}

// 新規登録フォームを空に戻すための初期値です。
const emptyCustomerForm: CustomerForm = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  status: 'prospect',
  memo: '',
}

const emptyProjectForm: ProjectForm = {
  customer_id: '',
  title: '',
  amount: '0',
  status: 'planned',
  start_date: '',
  due_date: '',
  description: '',
}

const emptyTaskForm: TaskForm = {
  project_id: '',
  title: '',
  due_date: '',
  status: 'todo',
  memo: '',
}

// 金額や日付は画面表示用にフォーマットして、人が読みやすい形にします。
const yenFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

/**
 * YYYY-MM-DD の日付文字列を「月/日」の表示に変換します。
 *
 * API から null が返ることもあるため、未設定の場合は '-' を表示します。
 */
const formatDate = (value: string | null) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

/**
 * API エラーを画面に出す短いメッセージへ変換します。
 *
 * Laravel のバリデーションエラーがある場合は、最初の 1 件を優先して表示します。
 */
const parseApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    const firstFieldError = error.errors ? Object.values(error.errors).flat()[0] : undefined
    return firstFieldError ?? error.message
  }

  return '処理に失敗しました。時間をおいて再度お試しください。'
}

function App() {
  // booting は最初のログイン状態確認中に、空画面がちらつかないようにするための状態です。
  const [booting, setBooting] = useState(true)
  // loading はログイン、ログアウト、再読み込みなどの通信中にボタン表示へ反映します。
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  // user が null のときは未ログイン画面を表示します。
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  // 学習用に、初期値として管理者ログイン情報を入れています。
  const [loginForm, setLoginForm] = useState({ email: 'admin@example.com', password: 'password' })
  // API から取得した業務データを画面の状態として保持します。
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  // 各フォームの入力値です。
  const [customerForm, setCustomerForm] = useState<CustomerForm>(emptyCustomerForm)
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm)
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm)
  // null なら新規登録、id が入っていれば編集モードとして扱います。
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  const isAdmin = user?.role === 'admin'

  /**
   * ダッシュボード、顧客、案件、タスクをまとめて再読み込みします。
   *
   * Promise.all を使うことで、4 つの API を順番ではなく並行して呼び出します。
   */
  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [summaryResponse, customerResponse, projectResponse, taskResponse] = await Promise.all([
        apiRequest<ApiItem<DashboardSummary>>('/api/dashboard/summary'),
        apiRequest<ApiList<Customer>>('/api/customers'),
        apiRequest<ApiList<Project>>('/api/projects'),
        apiRequest<ApiList<Task>>('/api/tasks'),
      ])

      setDashboard(summaryResponse.data)
      setCustomers(customerResponse.data)
      setProjects(projectResponse.data)
      setTasks(taskResponse.data)
    } catch (caught) {
      setError(parseApiError(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // 画面を開いたとき、既存の Cookie でログイン済みか確認します。
    const restoreSession = async () => {
      try {
        const response = await apiRequest<AuthResponse>('/api/me')
        setUser(response.user)
        await loadAll()
      } catch {
        setUser(null)
      } finally {
        setBooting(false)
      }
    }

    restoreSession()
  }, [loadAll])

  // タスクフォームの案件 select に表示する選択肢を作ります。
  // projects が変わったときだけ作り直せばよいため useMemo を使います。
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: `${project.title} / ${project.customer?.name ?? '顧客未設定'}`,
      })),
    [projects],
  )

  /**
   * ログインフォーム送信時の処理です。
   *
   * Sanctum では、ログイン前に CSRF Cookie を取得してから POST /api/login を呼びます。
   */
  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await csrfCookie()
      const response = await apiRequest<AuthResponse>('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      setUser(response.user)
      await loadAll()
    } catch (caught) {
      setError(parseApiError(caught))
    } finally {
      setLoading(false)
    }
  }

  /**
   * ログアウト処理です。
   *
   * サーバー側のセッションを破棄したあと、画面側に保持しているデータも空にします。
   */
  const logout = async () => {
    setLoading(true)
    setError('')

    try {
      await apiRequest('/api/logout', { method: 'POST' })
      setUser(null)
      setDashboard(null)
      setCustomers([])
      setProjects([])
      setTasks([])
      setActiveTab('dashboard')
    } catch (caught) {
      setError(parseApiError(caught))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 顧客の登録または更新を行います。
   *
   * editingCustomerId がある場合は PUT、ない場合は POST を使います。
   */
  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      const path = editingCustomerId ? `/api/customers/${editingCustomerId}` : '/api/customers'
      const method = editingCustomerId ? 'PUT' : 'POST'
      await apiRequest(path, {
        method,
        body: JSON.stringify(customerForm),
      })
      setCustomerForm(emptyCustomerForm)
      setEditingCustomerId(null)
      await loadAll()
    } catch (caught) {
      setError(parseApiError(caught))
    }
  }

  /**
   * 一覧の編集ボタンから、顧客フォームへ既存値を流し込みます。
   */
  const editCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id)
    setCustomerForm({
      name: customer.name,
      contact_name: customer.contact_name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      status: customer.status,
      memo: customer.memo ?? '',
    })
    setActiveTab('customers')
  }

  /**
   * 案件の登録または更新を行います。
   *
   * input では文字列として持っている customer_id と amount を API 送信前に数値へ変換します。
   */
  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      const path = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects'
      const method = editingProjectId ? 'PUT' : 'POST'
      await apiRequest(path, {
        method,
        body: JSON.stringify({
          ...projectForm,
          customer_id: Number(projectForm.customer_id),
          amount: Number(projectForm.amount),
          start_date: projectForm.start_date || null,
          due_date: projectForm.due_date || null,
        }),
      })
      setProjectForm(emptyProjectForm)
      setEditingProjectId(null)
      await loadAll()
    } catch (caught) {
      setError(parseApiError(caught))
    }
  }

  /**
   * 一覧の編集ボタンから、案件フォームへ既存値を流し込みます。
   */
  const editProject = (project: Project) => {
    setEditingProjectId(project.id)
    setProjectForm({
      customer_id: String(project.customer_id),
      title: project.title,
      amount: String(project.amount),
      status: project.status,
      start_date: project.start_date ?? '',
      due_date: project.due_date ?? '',
      description: project.description ?? '',
    })
    setActiveTab('projects')
  }

  /**
   * タスクの登録または更新を行います。
   *
   * project_id は API では数値が必要なので、送信前に Number() で変換します。
   */
  const saveTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      const path = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks'
      const method = editingTaskId ? 'PUT' : 'POST'
      await apiRequest(path, {
        method,
        body: JSON.stringify({
          ...taskForm,
          project_id: Number(taskForm.project_id),
          due_date: taskForm.due_date || null,
        }),
      })
      setTaskForm(emptyTaskForm)
      setEditingTaskId(null)
      await loadAll()
    } catch (caught) {
      setError(parseApiError(caught))
    }
  }

  /**
   * 一覧の編集ボタンから、タスクフォームへ既存値を流し込みます。
   */
  const editTask = (task: Task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      project_id: String(task.project_id),
      title: task.title,
      due_date: task.due_date ?? '',
      status: task.status,
      memo: task.memo ?? '',
    })
    setActiveTab('tasks')
  }

  /**
   * 顧客、案件、タスクの削除を共通化した処理です。
   *
   * 削除 API は admin だけ許可されます。画面でも admin のときだけ削除ボタンを表示します。
   */
  const destroyRecord = async (kind: 'customers' | 'projects' | 'tasks', id: number) => {
    const labels = {
      customers: '顧客',
      projects: '案件',
      tasks: 'タスク',
    }

    if (!window.confirm(`${labels[kind]}を削除します。よろしいですか？`)) return

    setError('')

    try {
      await apiRequest(`/api/${kind}/${id}`, { method: 'DELETE' })
      await loadAll()
    } catch (caught) {
      setError(parseApiError(caught))
    }
  }

  // 初回のログイン状態確認中は、読み込み画面だけを表示します。
  if (booting) {
    return (
      <main className="loading-screen">
        <LoaderCircle className="spin" size={28} />
      </main>
    )
  }

  // user がない場合は未ログインなので、ログインフォームだけを表示します。
  if (!user) {
    return (
      <main className="login-shell">
        <form className="login-panel" onSubmit={login}>
          <div>
            <p className="eyebrow">Business Sample</p>
            <h1>業務管理</h1>
          </div>

          {error && <p className="alert">{error}</p>}

          <label>
            メールアドレス
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            パスワード
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <CheckCircle2 size={18} />}
            ログイン
          </button>

          <div className="credential-row">
            <span>admin@example.com</span>
            <span>password</span>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="app-shell">
      {/* 左側のサイドバーです。タブ切り替えとログアウトを担当します。 */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <div>
            <strong>業務管理</strong>
            <span>{user.role === 'admin' ? '管理者' : '担当者'}</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="メイン">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            ダッシュボード
          </button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
            <Building2 size={18} />
            顧客
          </button>
          <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
            <BriefcaseBusiness size={18} />
            案件
          </button>
          <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
            <ListChecks size={18} />
            タスク
          </button>
        </nav>

        <div className="user-box">
          <span>{user.name}</span>
          <small>{user.email}</small>
          <button className="ghost-button" type="button" onClick={logout} disabled={loading}>
            <LogOut size={17} />
            ログアウト
          </button>
        </div>
      </aside>

      <section className="workspace">
        {/* 画面上部の見出しと再読み込みボタンです。 */}
        <header className="topbar">
          <div>
            <p className="eyebrow">Customer & Project Operations</p>
            <h1>
              {activeTab === 'dashboard' && 'ダッシュボード'}
              {activeTab === 'customers' && '顧客管理'}
              {activeTab === 'projects' && '案件管理'}
              {activeTab === 'tasks' && 'タスク管理'}
            </h1>
          </div>
          <button className="icon-button" type="button" onClick={loadAll} title="再読み込み" disabled={loading}>
            <RefreshCw className={loading ? 'spin' : ''} size={18} />
          </button>
        </header>

        {error && (
          <div className="alert row-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} title="閉じる">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ダッシュボードでは集計値と期限間近のタスクを表示します。 */}
        {activeTab === 'dashboard' && (
          <section className="dashboard-grid">
            <div className="metric">
              <span>顧客</span>
              <strong>{dashboard?.counts.customers ?? 0}</strong>
            </div>
            <div className="metric">
              <span>案件</span>
              <strong>{dashboard?.counts.projects ?? 0}</strong>
            </div>
            <div className="metric">
              <span>未完了タスク</span>
              <strong>{dashboard?.counts.open_tasks ?? 0}</strong>
            </div>

            <section className="work-panel wide">
              <div className="panel-heading">
                <h2>案件ステータス</h2>
              </div>
              <div className="status-bars">
                {(Object.keys(projectStatusLabels) as ProjectStatus[]).map((status) => (
                  <div className="status-row" key={status}>
                    <span>{projectStatusLabels[status]}</span>
                    <div>
                      <i style={{ width: `${Math.max((dashboard?.project_statuses[status] ?? 0) * 22, 8)}px` }} />
                    </div>
                    <strong>{dashboard?.project_statuses[status] ?? 0}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="work-panel">
              <div className="panel-heading">
                <h2>期限間近</h2>
              </div>
              <div className="compact-list">
                {(dashboard?.upcoming_tasks ?? []).map((task) => (
                  <article key={task.id}>
                    <strong>{task.title}</strong>
                    <span>
                      {formatDate(task.due_date)} / {task.project?.customer?.name ?? '-'}
                    </span>
                  </article>
                ))}
                {dashboard?.upcoming_tasks.length === 0 && <p className="empty">対象なし</p>}
              </div>
            </section>
          </section>
        )}

        {/* 顧客タブでは、左にフォーム、右に一覧を並べます。 */}
        {activeTab === 'customers' && (
          <section className="split-layout">
            <form className="work-panel form-panel" onSubmit={saveCustomer}>
              <div className="panel-heading">
                <h2>{editingCustomerId ? '顧客編集' : '顧客登録'}</h2>
                {editingCustomerId && (
                  <button
                    className="icon-button"
                    type="button"
                    title="編集を解除"
                    onClick={() => {
                      setEditingCustomerId(null)
                      setCustomerForm(emptyCustomerForm)
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              <label>
                会社名
                <input value={customerForm.name} onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                担当者
                <input value={customerForm.contact_name} onChange={(event) => setCustomerForm((current) => ({ ...current, contact_name: event.target.value }))} />
              </label>
              <label>
                メール
                <input type="email" value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                電話
                <input value={customerForm.phone} onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label>
                住所
                <input value={customerForm.address} onChange={(event) => setCustomerForm((current) => ({ ...current, address: event.target.value }))} />
              </label>
              <label>
                状態
                <select value={customerForm.status} onChange={(event) => setCustomerForm((current) => ({ ...current, status: event.target.value as CustomerStatus }))}>
                  {(Object.keys(customerStatusLabels) as CustomerStatus[]).map((status) => (
                    <option value={status} key={status}>
                      {customerStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                メモ
                <textarea value={customerForm.memo} onChange={(event) => setCustomerForm((current) => ({ ...current, memo: event.target.value }))} />
              </label>
              <button className="primary-button" type="submit">
                {editingCustomerId ? <Save size={18} /> : <Plus size={18} />}
                {editingCustomerId ? '保存' : '登録'}
              </button>
            </form>

            <section className="work-panel table-panel">
              <div className="data-table">
                <div className="table-row table-head">
                  <span>会社名</span>
                  <span>状態</span>
                  <span>案件</span>
                  <span />
                </div>
                {customers.map((customer) => (
                  <div className="table-row" key={customer.id}>
                    <span>
                      <strong>{customer.name}</strong>
                      <small>{customer.contact_name ?? '-'}</small>
                    </span>
                    <span className={`pill ${customer.status}`}>{customerStatusLabels[customer.status]}</span>
                    <span>{customer.projects_count ?? 0}</span>
                    <span className="actions">
                      <button className="icon-button" type="button" title="編集" onClick={() => editCustomer(customer)}>
                        <Pencil size={16} />
                      </button>
                      {isAdmin && (
                        <button className="icon-button danger" type="button" title="削除" onClick={() => destroyRecord('customers', customer.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}

        {/* 案件タブでは、顧客を選んで案件を登録・編集します。 */}
        {activeTab === 'projects' && (
          <section className="split-layout">
            <form className="work-panel form-panel" onSubmit={saveProject}>
              <div className="panel-heading">
                <h2>{editingProjectId ? '案件編集' : '案件登録'}</h2>
                {editingProjectId && (
                  <button
                    className="icon-button"
                    type="button"
                    title="編集を解除"
                    onClick={() => {
                      setEditingProjectId(null)
                      setProjectForm(emptyProjectForm)
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              <label>
                顧客
                <select value={projectForm.customer_id} onChange={(event) => setProjectForm((current) => ({ ...current, customer_id: event.target.value }))} required>
                  <option value="">選択してください</option>
                  {customers.map((customer) => (
                    <option value={customer.id} key={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                件名
                <input value={projectForm.title} onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))} required />
              </label>
              <label>
                金額
                <input type="number" min="0" value={projectForm.amount} onChange={(event) => setProjectForm((current) => ({ ...current, amount: event.target.value }))} required />
              </label>
              <label>
                状態
                <select value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}>
                  {(Object.keys(projectStatusLabels) as ProjectStatus[]).map((status) => (
                    <option value={status} key={status}>
                      {projectStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="field-row">
                <label>
                  開始日
                  <input type="date" value={projectForm.start_date} onChange={(event) => setProjectForm((current) => ({ ...current, start_date: event.target.value }))} />
                </label>
                <label>
                  期限
                  <input type="date" value={projectForm.due_date} onChange={(event) => setProjectForm((current) => ({ ...current, due_date: event.target.value }))} />
                </label>
              </div>
              <label>
                内容
                <textarea value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <button className="primary-button" type="submit" disabled={customers.length === 0}>
                {editingProjectId ? <Save size={18} /> : <Plus size={18} />}
                {editingProjectId ? '保存' : '登録'}
              </button>
            </form>

            <section className="work-panel table-panel">
              <div className="data-table">
                <div className="table-row project-row table-head">
                  <span>案件</span>
                  <span>顧客</span>
                  <span>状態</span>
                  <span>金額</span>
                  <span />
                </div>
                {projects.map((project) => (
                  <div className="table-row project-row" key={project.id}>
                    <span>
                      <strong>{project.title}</strong>
                      <small>
                        {formatDate(project.start_date)} - {formatDate(project.due_date)}
                      </small>
                    </span>
                    <span>{project.customer?.name ?? '-'}</span>
                    <span className={`pill ${project.status}`}>{projectStatusLabels[project.status]}</span>
                    <span>{yenFormatter.format(project.amount)}</span>
                    <span className="actions">
                      <button className="icon-button" type="button" title="編集" onClick={() => editProject(project)}>
                        <Pencil size={16} />
                      </button>
                      {isAdmin && (
                        <button className="icon-button danger" type="button" title="削除" onClick={() => destroyRecord('projects', project.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}

        {/* タスクタブでは、案件に紐づく作業を登録・編集します。 */}
        {activeTab === 'tasks' && (
          <section className="split-layout">
            <form className="work-panel form-panel" onSubmit={saveTask}>
              <div className="panel-heading">
                <h2>{editingTaskId ? 'タスク編集' : 'タスク登録'}</h2>
                {editingTaskId && (
                  <button
                    className="icon-button"
                    type="button"
                    title="編集を解除"
                    onClick={() => {
                      setEditingTaskId(null)
                      setTaskForm(emptyTaskForm)
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              <label>
                案件
                <select value={taskForm.project_id} onChange={(event) => setTaskForm((current) => ({ ...current, project_id: event.target.value }))} required>
                  <option value="">選択してください</option>
                  {projectOptions.map((project) => (
                    <option value={project.id} key={project.id}>
                      {project.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                件名
                <input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required />
              </label>
              <label>
                期限
                <input type="date" value={taskForm.due_date} onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))} />
              </label>
              <label>
                状態
                <select value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}>
                  {(Object.keys(taskStatusLabels) as TaskStatus[]).map((status) => (
                    <option value={status} key={status}>
                      {taskStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                メモ
                <textarea value={taskForm.memo} onChange={(event) => setTaskForm((current) => ({ ...current, memo: event.target.value }))} />
              </label>
              <button className="primary-button" type="submit" disabled={projects.length === 0}>
                {editingTaskId ? <Save size={18} /> : <Plus size={18} />}
                {editingTaskId ? '保存' : '登録'}
              </button>
            </form>

            <section className="work-panel table-panel">
              <div className="data-table">
                <div className="table-row task-row table-head">
                  <span>タスク</span>
                  <span>案件</span>
                  <span>期限</span>
                  <span>状態</span>
                  <span />
                </div>
                {tasks.map((task) => (
                  <div className="table-row task-row" key={task.id}>
                    <span>
                      <strong>{task.title}</strong>
                      <small>{task.assignee?.name ?? '-'}</small>
                    </span>
                    <span>{task.project?.title ?? '-'}</span>
                    <span>{formatDate(task.due_date)}</span>
                    <span className={`pill ${task.status}`}>{taskStatusLabels[task.status]}</span>
                    <span className="actions">
                      <button className="icon-button" type="button" title="編集" onClick={() => editTask(task)}>
                        <Pencil size={16} />
                      </button>
                      {isAdmin && (
                        <button className="icon-button danger" type="button" title="削除" onClick={() => destroyRecord('tasks', task.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
