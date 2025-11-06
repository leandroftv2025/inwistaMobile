/**
 * ====================================
 * INWISTAMOBILE - PM2 ECOSYSTEM CONFIG
 * ====================================
 * Configuração de gerenciamento de processos com PM2
 *
 * QUANDO USAR:
 * - App único sem dependências complexas (sem DB/Redis separados)
 * - Servidor com recursos limitados
 * - Precisa de auto-restart e monitoramento simples
 *
 * QUANDO NÃO USAR:
 * - Múltiplos serviços (API + DB + Cache) → Use Docker Compose
 * - Infraestrutura complexa → Use EasyPanel/Kubernetes
 *
 * COMANDOS:
 *   pm2 start ecosystem.config.cjs                 # Iniciar
 *   pm2 start ecosystem.config.cjs --env production # Produção
 *   pm2 stop inwistamobile                         # Parar
 *   pm2 restart inwistamobile                      # Reiniciar
 *   pm2 reload inwistamobile                       # Reload (zero-downtime)
 *   pm2 logs inwistamobile                         # Ver logs
 *   pm2 monit                                      # Monitor interativo
 *   pm2 status                                     # Status
 */

module.exports = {
  apps: [
    {
      // ----------------------------------------
      // CONFIGURAÇÃO PRINCIPAL
      // ----------------------------------------
      name: 'inwistamobile',
      script: './dist/index.js',
      cwd: './',

      // ----------------------------------------
      // INSTÂNCIAS E MODO
      // ----------------------------------------
      instances: 'max',              // Número de instâncias (1 ou 'max' para usar todos os CPUs)
      exec_mode: 'cluster',          // 'cluster' para múltiplas instâncias, 'fork' para single

      // ----------------------------------------
      // VARIÁVEIS DE AMBIENTE (desenvolvimento)
      // ----------------------------------------
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        LOG_LEVEL: 'debug',
        DEBUG: 'true',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/inwistamobile',
        SESSION_SECRET: 'development-secret-change-in-production',
      },

      // ----------------------------------------
      // VARIÁVEIS DE AMBIENTE (produção)
      // ----------------------------------------
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'info',
        DEBUG: 'false',
        // DATABASE_URL deve ser configurada no servidor
        // SESSION_SECRET deve ser configurada no servidor
      },

      // ----------------------------------------
      // AUTO-RESTART E HEALTH
      // ----------------------------------------
      watch: false,                  // Não assistir mudanças em produção (use true em dev)
      ignore_watch: [                // Ignorar estas pastas se watch: true
        'node_modules',
        'dist',
        'logs',
        '.git',
      ],
      max_memory_restart: '512M',    // Reiniciar se usar mais de 512MB

      // ----------------------------------------
      // RESTARTS INTELIGENTES
      // ----------------------------------------
      autorestart: true,             // Auto-restart em caso de crash
      max_restarts: 10,              // Máximo de restarts consecutivos
      min_uptime: '10s',             // Tempo mínimo de uptime para considerar start bem-sucedido
      restart_delay: 4000,           // Delay entre restarts (ms)

      // ----------------------------------------
      // KILL TIMEOUT
      // ----------------------------------------
      kill_timeout: 5000,            // Tempo para graceful shutdown (ms)
      wait_ready: true,              // Esperar por process.send('ready')
      listen_timeout: 10000,         // Timeout para app começar a escutar

      // ----------------------------------------
      // LOGS
      // ----------------------------------------
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,                    // Adicionar timestamp nos logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,              // Combinar logs de todas as instâncias

      // ----------------------------------------
      // ADVANCED OPTIONS
      // ----------------------------------------
      cron_restart: '0 3 * * *',     // Restart diário às 3:00 AM (opcional, descomente se necessário)
      // cron_restart: '',           // Desabilitar cron restart

      // ----------------------------------------
      // INTERPRETER (Node.js)
      // ----------------------------------------
      interpreter: 'node',           // Usar Node.js
      interpreter_args: '--max-old-space-size=512 --enable-source-maps',

      // ----------------------------------------
      // SOURCE MAP SUPPORT
      // ----------------------------------------
      source_map_support: true,

      // ----------------------------------------
      // GRACEFUL SHUTDOWN
      // ----------------------------------------
      // O servidor deve implementar:
      //   process.on('SIGINT', () => { /* cleanup */ process.exit(0); });

      // ----------------------------------------
      // HEALTH CHECK (requer pm2-health)
      // ----------------------------------------
      // health_check: {
      //   endpoint: 'http://localhost:5000/api/healthz',
      //   interval: 30000,           // 30 segundos
      //   timeout: 5000,             // 5 segundos
      // },
    },
  ],

  // ----------------------------------------
  // DEPLOY CONFIGURATION (opcional)
  // ----------------------------------------
  deploy: {
    production: {
      user: 'nodejs',                // Usuário SSH no servidor
      host: '192.168.1.15',          // IP do servidor
      ref: 'origin/main',            // Branch do Git
      repo: 'https://github.com/leandroftv2025/inwistaMobile.git',
      path: '/home/nodejs/inwistamobile',
      'post-deploy': 'npm ci --legacy-peer-deps && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'echo "Preparando servidor para deploy..."',
    },

    development: {
      user: 'nodejs',
      host: '192.168.1.15',
      ref: 'origin/develop',
      repo: 'https://github.com/leandroftv2025/inwistaMobile.git',
      path: '/home/nodejs/inwistamobile-dev',
      'post-deploy': 'npm ci --legacy-peer-deps && npm run build:dev && pm2 reload ecosystem.config.cjs --env development',
    },
  },
};

/**
 * ====================================
 * COMANDOS ÚTEIS PM2
 * ====================================
 *
 * BÁSICOS:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop inwistamobile
 *   pm2 restart inwistamobile
 *   pm2 delete inwistamobile
 *
 * LOGS:
 *   pm2 logs inwistamobile
 *   pm2 logs inwistamobile --lines 100
 *   pm2 logs inwistamobile --raw
 *   pm2 flush                              # Limpar logs
 *
 * MONITORAMENTO:
 *   pm2 status
 *   pm2 monit
 *   pm2 info inwistamobile
 *   pm2 describe inwistamobile
 *
 * RELOAD (ZERO-DOWNTIME):
 *   pm2 reload inwistamobile
 *
 * STARTUP SCRIPT:
 *   pm2 startup                            # Gerar script de startup
 *   pm2 save                               # Salvar configuração atual
 *   pm2 unstartup systemd                  # Remover startup
 *
 * DEPLOY:
 *   pm2 deploy ecosystem.config.cjs production setup
 *   pm2 deploy ecosystem.config.cjs production
 *   pm2 deploy ecosystem.config.cjs production update
 *
 * PLUS (MONITORAMENTO CLOUD):
 *   pm2 plus                               # Conectar ao PM2 Plus
 *   pm2 link <secret> <public>             # Link com PM2 Plus
 *
 * ====================================
 * TROUBLESHOOTING
 * ====================================
 *
 * App não inicia:
 *   - Verificar logs: pm2 logs inwistamobile --err
 *   - Verificar .env: DATABASE_URL, SESSION_SECRET
 *   - Verificar build: npm run build
 *
 * Memory leaks:
 *   - Diminuir max_memory_restart
 *   - Usar pm2 monit para monitorar
 *   - Investigar com node --inspect
 *
 * Restarts frequentes:
 *   - Aumentar min_uptime
 *   - Verificar max_restarts
 *   - Checar logs de erro
 *
 * ====================================
 * PERFORMANCE TUNING
 * ====================================
 *
 * Servidor pequeno (1-2 CPUs):
 *   instances: 1
 *   exec_mode: 'fork'
 *
 * Servidor médio (4+ CPUs):
 *   instances: 'max'
 *   exec_mode: 'cluster'
 *
 * Servidor grande (8+ CPUs):
 *   instances: 'max'
 *   exec_mode: 'cluster'
 *   max_memory_restart: '1G'
 */
