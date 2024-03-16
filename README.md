<p align="center">
  <a href="https://jk.i3060.com" target="_blank">
    <picture>
      <img alt="PowerOps" src="https://img.wenhairu.com/images/2024/01/26/7o4xB.png" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  使用 WebSDK 轻松开发 I3060 新能源应用
</p>


<p align="center">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dt/power-ops-websdk">
  <img alt="GitHub License" src="https://img.shields.io/github/license/SamNofee/power-ops-websdk">
  <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/SamNofee/power-ops-websdk/npm.yml">
</p>

---

<br />

# WEB SDK (Beta 阶段)

> **官网：[jk.i3060.com](/https://jk.i3060.com)**

I3060 致力于成为新能源数字化平台中的基础设施，一个保持最大开放性和兼容性的 SaaS 平台，Web SDK 就是实现这一目的的重要对外口，我们欢迎第三方新能源数字化信息服务提供商，接入到我们的平台中，一起助力电力行业数字化建设和「3060 双碳计划」

<br />

## SDK 功能介绍

- 可让您的前端应用快速接入 I3060 平台
- 使用 TypeScript 编写
- 基于 SSR Web Component 不限前端框架
- Web SDK 遵循 MIT 协议源代码开放
- 移动端受到内置优化

<br />

## 快速上手

NPM 引入

```sh
npm install power-ops-websdk
```

CDN 引入
```html
<script type="module">
import { Core } from 'https://cdn.jsdelivr.net/npm/power-ops-websdk/lib/core/index.js'
</script>
```

用法
```typescript
import { Core } from 'power-ops-websdk/lib/core/index'
// 下面这种引入方式打包体积会变大
// import { Core } from 'power-ops-websdk'

const core = new Core({ window, document })

console.log(core.getToken()) // 如果没登录，会被弹出到登录界面
console.log(core.getCurrentUser())
```

<br />

## CLI Reference

打包为压缩包
```sh
npx websdk-cli build --manifest manifest.json --input ./dist --pack dist.zip
```

部署压缩包
```sh
# KEY 和 UUID 可在 https://jk.i3060.com/developer 获取
export KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
npx websdk-cli deploy --key $KEY --uuid $UUID --pack dist.zip --endpoint https://jk.i3060.com
```

查看 CLI 帮助
```sh
npx websdk-cli -h
npx websdk-cli build -h
npx websdk-cli deploy -h
```

<br />

## API Reference

[**Core Kit**](https://samnofee.github.io/power-ops-websdk/classes/Core.html): 核心类
