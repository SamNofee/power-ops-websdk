import { Core, Node } from '../core/index'

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
   * 获取部门列表
   */
  async queryDepartments(): Promise<Node[]> {
    const data = await this.req('get', '/api/v1/node/nodes/departments')
    return data?.nodes || []
  }

  /**
   * 获取电站列表
   */
  async querySites(): Promise<Node[]> {
    const data = await this.req('get', '/api/v1/node/nodes/sites')
    return data?.nodes || []
  }
}
