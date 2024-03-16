import Color from 'color'

export interface User {
  _id: string
  creator: number
  name: string
  phone: string
  status: UserStatusType
  objectType: UserObjectType
  gender: GenderType
  createdTime: string
  avatarFileId?: string
  roles?: Role[]
  roleUuids: string[]
}

export const GenderSet = ['FEMALE', 'MALE', 'SECRET'] as const
export type GenderType = (typeof GenderSet)[number]

export const UIKeySet = ['MODULE_HEADER'] as const
export type UIKeyType = (typeof UIKeySet)[number]

export const UserStatusSet = ['DELETED', 'NORMAL', 'BLOCKED'] as const
export type UserStatusType = (typeof UserStatusSet)[number]

export const UserObjectTypeSet = ['GLOBAL', 'SITE'] as const
export type UserObjectType = (typeof UserObjectTypeSet)[number]

/**
 * 组织树节点，公司 电站 部门
 */
export interface Role {
  name: string
  uuid: string
  virtual?: boolean
  objectType?: RoleObjectType
  childrenUuids?: string[]
}

export const RoleObjectTypeSet = ['DEPARTMENT', 'SITE', 'COMPANY'] as const
export type RoleObjectType = (typeof RoleObjectTypeSet)[number]

export const ColorNameSet = ['main', 'char', 'primary', 'error', 'warning', 'success', 'info'] as const
export type ColorName = (typeof ColorNameSet)[number]

export const ColorLevelSet = ['100', '200', '300', '400', '500', '600', '700', '800', '900'] as const
export type ColorLevel = (typeof ColorLevelSet)[number]

export const ColorSchemeSet = ['light', 'dark'] as const
export type ColorScheme = (typeof ColorSchemeSet)[number]

export interface CoreWindow {
  location: {
    search: URLSearchParams
    href: string
    reload(): void
    pathname: string
  }
  localStorage: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    clear(): void
  }
  injected?: {
    isProd: boolean
    uuid: string
  }
}

export interface CoreDocument {
  getElementById(id: string): any | null
  createElement(tag: string): any
  head: {
    appendChild(child: any): void
  }
}

/**
 * 上下文，浏览器环境传 window 和 document，RoleJS 环境传 null
 */
export interface CoreOptions {
  window: any
  document: any
  endpoint?: string
}

/**
 * 核心类，SDK 的基础，可以获取 Token、颜色、基础信息
 */
export class Core {
  private window: CoreWindow
  private document: CoreDocument
  private endpoint = 'https://jk.i3060.com'

  private kColorScheme = '__APP_COLOR_SCHEME'
  private kToken = '__APP_TOKEN'
  private kKVCache = '__APP_CLIENT_KV_CACHE'

  constructor(options: CoreOptions) {
    if (options.window) this.window = options.window as CoreWindow
    if (options.document) this.document = options.document as CoreDocument
    if (options?.endpoint) this.endpoint = options.endpoint
  }

  /**
   * 是否是正式环境
   */
  public isProd(): boolean {
    return this.window.injected?.isProd || false
  }

  /**
   * 获取 Endpoint
   */
  public getEndpoint(): string {
    return this.endpoint
  }

  /**
   * 获取 Token，如果没登录会被弹出到登录界面，登录成功后会重定向回当前页面
   */
  public getToken(): string | null {
    const paramToken = this.getParam('token')
    if (paramToken) {
      this.window.localStorage.setItem(this.kToken, paramToken)
    }

    const token = this.window.localStorage.getItem(this.kToken)
    if (!token) {
      this.login()
      return null
    }

    return token
  }

  /**
   * 获取当前应用的 UUID
   */
  public getAppUuid(): string | null {
    return this.window.injected?.uuid || null
  }

  /**
   * 获取 URL 参数，当前页面是 /plugin/xxxxxx?key=foo 的话 getParam('key') 返回 foo
   */
  public getParam(key: string): string | null {
    const params = new URLSearchParams(this.window.location.search)
    const param = params.get(key)
    return param
  }

  /**
   * 获取当前主题
   */
  public getColorScheme(): ColorScheme {
    return (this.window.localStorage.getItem(this.kColorScheme) || 'dark') as ColorScheme
  }

  /**
   * 设置当前主题，这会重新加载页面
   */
  public setColorScheme(scheme: ColorScheme) {
    this.window.localStorage.setItem(this.kColorScheme, scheme)
  }

  /**
   * 获取选择的电站
   */
  public getSelectedSite(): Role | null {
    const cache = this.window.localStorage.getItem(this.kKVCache)
    if (!cache) return null

    return JSON.parse(cache)?.selectedSite || null
  }

  /**
   * 获取当前用户的信息
   */
  public getCurrentUser(): User | null {
    const cache = this.window.localStorage.getItem(this.kKVCache)
    if (!cache) return null

    return JSON.parse(cache)?.current || null
  }

  /**
   * 前往登录页面
   */
  public login() {
    this.window.location.href = `${this.endpoint}/login?signature=true&last=${encodeURIComponent(this.window.location.href)}`
  }

  /**
   * 加载 Web Component
   * 例如：await loadUI('MODULE_HEADER') 调用后就可以直接用 <websdk-module-header />
   */
  public async loadUI(key: UIKeyType) {
    return this.loadScript(`${this.endpoint}/websdk/${key.toLowerCase()}.js`)
  }

  /**
   * 异步加载 Script
   */
  public async loadScript(src: string) {
    const script = this.document.createElement('script')
    script.type = 'module'
    script.src = src
    script.async = true

    return new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      this.document.head.appendChild(script)
    })
  }

  /**
   * 获取颜色
   */
  public getColor(
    name: ColorName,
    level: ColorLevel,
    options?: {
      scheme?: ColorScheme
    }
  ): string {
    const dark: Record<ColorName, string> = {
      primary: '#00d3d8',
      error: '#ef4444',
      info: '#04ade2',
      warning: '#f59e0b',
      success: '#10b981',
      main: '#013769',
      char: '#d1dbe9'
    }
    const mapping: Record<ColorScheme, Record<ColorName, string>> = {
      dark,
      light: {
        ...dark,
        main: '#f1f5f9',
        char: '#475569'
      }
    }
    const scheme = options?.scheme || this.getColorScheme()
    const index = ColorLevelSet.indexOf(level)
    const middle = 4

    let output = Color(mapping[scheme][name])

    if (scheme === 'dark') {
      const filterLight = Color('#ffffff').mix(Color(mapping[scheme].char), 0.4)
      const filterDark = Color('#000000').mix(Color(mapping[scheme].main), 0.4)
      if (index < middle) output = output.mix(filterLight, (name === 'main' ? 0.03 : 0.14) * (middle - index))
      if (index > middle) output = output.mix(filterDark, 0.14 * (index - middle))
    } else {
      const filterLight = Color('#ffffff')
      const filterDark = Color('#000000').mix(Color(mapping[scheme].main), 0.2)
      if (index < middle) output = output.mix(filterDark, (name === 'main' ? 0.03 : 0.16) * (middle - index))
      if (index > middle) output = output.mix(filterLight, (name === 'main' ? 0.3 : 0.16) * (index - middle))
      if (!(name === 'char' || name === 'main')) output = output.desaturate(0.2)
    }

    return output.hex()
  }
}
