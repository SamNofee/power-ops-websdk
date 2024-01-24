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
  roles?: Node[]
  roleUuids: string[]
}

export const GenderSet = ['FEMALE', 'MALE', 'SECRET'] as const
export type GenderType = (typeof GenderSet)[number]

export const UserStatusSet = ['DELETED', 'NORMAL', 'BLOCKED'] as const
export type UserStatusType = (typeof UserStatusSet)[number]

export const UserObjectTypeSet = ['GLOBAL', 'SITE'] as const
export type UserObjectType = (typeof UserObjectTypeSet)[number]

export interface Node {
  name: string
  uuid: string,
  objectType?: NodeObjectType
  childrenUuids?: string[]
}

export const NodeObjectTypeSet = ['DEPARTMENT', 'SITE', 'COMPANY'] as const
export type NodeObjectType = (typeof NodeObjectTypeSet)[number]

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
  getElementById(id: string): Element | null
}

export interface CoreOptions {
  window: any
  document: any
}

export class Core {
  private window: CoreWindow
  private document: CoreDocument

  private kColorScheme = '__APP_COLOR_SCHEME'
  private kToken = '__APP_TOKEN'
  private kKVCache = '__APP_KV_CACHE'

  constructor(options: CoreOptions) {
    if (options.window) this.window = options.window as CoreWindow
    if (options.document) this.document = options.document as CoreDocument
  }

  public isProd(): boolean {
    return this.window.injected?.isProd || false
  }

  public getToken(): string | null {
    return this.window.localStorage.getItem(this.kToken)
  }

  public getAppUuid(): string | null {
    return this.window.injected?.uuid || null
  }

  public getParam(key: string): string | null {
    const params = new URLSearchParams(this.window.location.search)
    const param = params.get(key)
    return param
  }

  public getColorScheme(): ColorScheme {
    return (this.window.localStorage.getItem(this.kColorScheme) || 'dark') as ColorScheme
  }

  public setColorScheme(scheme: ColorScheme) {
    this.window.localStorage.setItem(this.kColorScheme, scheme)
  }

  public getSelectedSite(): Node | null {
    const cache = this.window.localStorage.getItem(this.kKVCache)
    if (!cache) return null

    return JSON.parse(cache)?.selectedSite || null
  }

  public getCurrentUser(): User | null {
    const cache = this.window.localStorage.getItem(this.kKVCache)
    if (!cache) return null

    return JSON.parse(cache)?.current || null
  }

  public login() {
    this.window.location.href = `/login?last=${this.window.location.pathname}`
  }

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
