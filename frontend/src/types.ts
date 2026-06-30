// ユーザー権限です。admin は削除可能、staff は登録・編集中心です。
export type Role = 'admin' | 'staff'

// Laravel の users テーブルから返るログインユーザー情報です。
export type User = {
  id: number
  name: string
  email: string
  role: Role
}

// 画面の選択肢や API バリデーションで使う状態値です。
// 値自体は API と DB に保存されるため、英語のまま固定しています。
export type CustomerStatus = 'prospect' | 'active' | 'inactive'
export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold'
export type TaskStatus = 'todo' | 'doing' | 'done'

// 顧客データです。projects_count は一覧 API で付与される案件数です。
export type Customer = {
  id: number
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  status: CustomerStatus
  memo: string | null
  projects_count?: number
}

// 案件データです。customer や owner は API 側で関連データを読み込んだときだけ入ります。
export type Project = {
  id: number
  customer_id: number
  owner_id: number | null
  title: string
  amount: number
  status: ProjectStatus
  start_date: string | null
  due_date: string | null
  description: string | null
  customer?: Customer
  owner?: User | null
  tasks_count?: number
}

// タスクデータです。project や assignee は一覧表示で必要な関連情報です。
export type Task = {
  id: number
  project_id: number
  assignee_id: number | null
  title: string
  due_date: string | null
  status: TaskStatus
  memo: string | null
  project?: Project
  assignee?: User | null
}

// ダッシュボード API のレスポンス本体です。
export type DashboardSummary = {
  counts: {
    customers: number
    projects: number
    open_tasks: number
  }
  project_statuses: Partial<Record<ProjectStatus, number>>
  upcoming_tasks: Task[]
}

// Laravel API の一覧レスポンスは { data: [...] } の形にそろえています。
export type ApiList<T> = {
  data: T[]
}

// Laravel API の詳細・登録・更新レスポンスは { data: ... } の形にそろえています。
export type ApiItem<T> = {
  data: T
}

// ログイン API とログイン状態確認 API のレスポンスです。
export type AuthResponse = {
  user: User
}
