const init = (configFile: string, cliFolder: string) => (
    {
        description: 'init cli with setup default',
        prompts:[],
        actions: [
          {
            type: 'copy',
            src: 'templates/init/config.cli.json',
            dest: configFile
          },
          {
            type: 'addFolder',
            dest: cliFolder
          }
        ]
      }
)

export default init