import { program } from 'commander'
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, createReadStream } from 'node:fs'
import { join } from 'node:path'
import FormData from 'form-data'
import { zipSync } from 'fflate'

function processFolder(folder: string): Record<string, any> {
  const data: Record<string, any> = {}

  readdirSync(folder).forEach(file => {
    const filePath = join(folder, file)
    const stat = statSync(filePath)
    data[file] = stat.isFile() ? readFileSync(filePath) : processFolder(filePath)
  })

  return data
}

program.name('Power Ops WebSDK CLI')

program
  .command('build')
  .description('build to zip')
  .option('--input <string>', '输入文件夹')
  .option('--pack <string>', '输出压缩包，需以 zip 结尾')
  .option('--manifest <string>', '配置文件 manifest.json')
  .action(function (
    options: {
      input?: string,
      pack?: string,
      manifest?: string
    }
  ) {
    if (!options?.manifest) throw '请指定 manifest.json'
    if (!options?.pack || !options.pack.endsWith('.zip')) throw 'pack 需以 zip 结尾'
    if (!options?.input || !existsSync(options.input)) throw 'input 文件夹不存在'
    
    const processed = processFolder(options.input)
    processed['manifest.json'] = readFileSync(options.manifest)

    writeFileSync(options.pack, zipSync({ app: processed }))
    console.log('成功打包到', options.pack)
  })

program
  .command('deploy')
  .description('deploy to i3060')
  .option('--pack <string>', '输入压缩包，需以 zip 结尾')
  .option('--key <string>', '32 位密钥，在开放平台获取')
  .option('--uuid <string>', '应用 UUID，在开放平台获取')
  .option('--endpoint <string>', '平台 URL')
  .action(function (
    options: {
      pack?: string,
      key?: string,
      uuid?: string
      endpoint?: string
    }
  ) {
    if (!options?.pack || !options.pack.endsWith('.zip')) throw 'pack 需以 zip 结尾'
    if (!options?.uuid || !options?.key) throw '请指定 KEY 和 UUID'

    const endpoint = options?.endpoint || 'https://jk.i3060.com'

    const formData = new FormData()
    formData.append('uuid', options.uuid)
    formData.append('key', options.key)
    formData.append('file', createReadStream(options.pack))
    formData.submit(`${endpoint}/api/v1/plugin/upload`, (err, res) => {
      let data = ''
      res.resume()
        .on('data', (chunk) => data += chunk)
        .on('error', (error) => console.log(error))
        .on('end', () => data.indexOf('请求成功') === -1 ? console.log(data) : '上传成功')
    })
  })


program.parse()
