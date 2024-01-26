import { program } from 'commander'

program.name('Power Ops WebSDK CLI')

program
  .command('deploy')
  .description('deploy to i3060')
  .action(function () {
    console.log('deploy')
  })

program
  .command('build')
  .description('build to zip')
  .action(function () {
    console.log('build')
  })

program
  .command('mock')
  .description('mock token')
  .action(function () {
    console.log('mock')
  })