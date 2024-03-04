import { Core, Role, RoleObjectType } from '../core/index'

export function buildTree<T>(roles: Role[], callback: (role: Role, children: T[]) => T): T[] {
  const rootlessUuids = roles
    .map(x => x.childrenUuids || [])
    .concat()
    .flat()
  const rootUuids = roles.map(x => x.uuid).filter(x => rootlessUuids.indexOf(x) === -1)

  function recursion(childrenUuids: string[]): T[] {
    const found = roles.filter(x => childrenUuids.indexOf(x.uuid) !== -1)
    return found.map(role => callback(role, role?.childrenUuids ? recursion(role.childrenUuids) : []))
  }

  return recursion(rootUuids)
}

export function traverse<T extends { children?: T[] }>(tree: T[], callback: (x: T) => void) {
  for (const x of tree) {
    callback(x)
    traverse(x?.children || [], callback)
  }
}

export const FormulaCycleSet = ['HOUR', 'DAY', 'MONTH', 'YEAR'] as const
export type FormulaCycle = (typeof FormulaCycleSet)[number]

export const FormulaCalculateTypeSet = ['CUMULATION', 'DIFFERENT'] as const
export type FormulaCalculateType = (typeof FormulaCalculateTypeSet)[number]

export const FormulaObjectTypeSet = [
  'OTHER',
  'CONSUME_POWER',
  'UPGRID_POWER',
  'USAGE_POWER',
  'DOWNGRID_POWER',
  'GENERATE_POWER',
  'CONSUME_POWER_MONEY',
  'UPGRID_POWER_MONEY',
  'USAGE_POWER_MONEY',
  'DOWNGRID_POWER_MONEY',
  'GENERATE_POWER_MONEY'
] as const
export type FormulaObjectType = (typeof FormulaObjectTypeSet)[number]
export const FormulaObjectTypeLabel: Record<FormulaObjectType, string> = {
  OTHER: '其他',
  CONSUME_POWER: '消纳电量',
  UPGRID_POWER: '上网电量',
  USAGE_POWER: '用电电量',
  DOWNGRID_POWER: '购电电量',
  GENERATE_POWER: '发电电量',
  CONSUME_POWER_MONEY: '消纳电费',
  UPGRID_POWER_MONEY: '上网电费',
  USAGE_POWER_MONEY: '用电电费',
  DOWNGRID_POWER_MONEY: '购电电费',
  GENERATE_POWER_MONEY: '发电电费'
}

export class Http {
  private core: Core

  constructor(core: Core) {
    this.core = core
  }

  public async req(
    method: 'get' | 'post' | 'delete' | 'put',
    url: string,
    options?: {
      data?: any
      params?: any
      endpoint?: string
    }
  ) {
    const request: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        token: this.core.getToken() || ''
      }
    }

    if (options?.params) url += '?' + new URLSearchParams(options.params).toString()
    if (options?.data) request.body = JSON.stringify(options.data)

    const res = await fetch((options?.endpoint || 'https://jk.i3060.com') + url, request)
    const data: any = await res.json()
    if (data?.message === '请先登录') this.core.login()
    return data?.data
  }

  /**
   * 获取 Role 列表
   */
  async queryRoles(objectType: RoleObjectType, withoutVirtual?: boolean): Promise<Role[]> {
    const data = await this.req('get', ' /api/v1/role/roles', { params: { objectType, withoutVirtual } })
    return data?.roles || []
  }

  /**
   * 执行 Flux 公式
   */
  async calculateFormula(
    siteUuid: string,
    start: Date,
    stop: Date,
    cycle: FormulaCycle,
    calculateType: FormulaCalculateType,
    objectType?: FormulaObjectType,
    formula?: string
  ): Promise<{ value: number; time: string }[]> {
    const res = await this.req('post', '/api/v1/formula/calculate', {
      data: { cycle, siteUuid, start: start.toISOString(), stop: stop.toISOString(), objectType, formula, calculateType }
    })
    return res?.result?.map(x => ({ value: x.value, time: x.time })) || []
  }
}
