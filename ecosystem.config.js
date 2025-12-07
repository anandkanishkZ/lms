module.exports = {
  apps: [
    // =========================================================================
    // BACKEND APPLICATION (Node.js + Express + Prisma)
    // =========================================================================
    {
      name: 'lms-backend',
      script: './dist/server.js',
      cwd: '/home/zwicky/lms/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5005
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5005
      },
      error_file: './logs/pm2-backend-error.log',
      out_file: './logs/pm2-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Advanced PM2 features
      cron_restart: '0 3 * * *', // Restart daily at 3 AM (optional)
      
      // Environment-specific configurations
      instance_var: 'INSTANCE_ID',
      
      // Log rotation settings
      log_type: 'json',
      
      // Error handling
      exp_backoff_restart_delay: 100,
      
      // Performance monitoring
      pmx: true,
      
      // Source map support for debugging
      source_map_support: true,
      
      // Node.js specific options
      node_args: '--max-old-space-size=2048',
      
      // Graceful shutdown
      wait_ready: true,
      
      // Additional metadata
      vizion: true,
      post_update: ['npm install', 'npx prisma generate']
    },

    // =========================================================================
    // FRONTEND APPLICATION (Next.js)
    // =========================================================================
    {
      name: 'lms-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/zwicky/lms/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Advanced PM2 features
      cron_restart: '0 4 * * *', // Restart daily at 4 AM (optional)
      
      // Log rotation settings
      log_type: 'json',
      
      // Error handling
      exp_backoff_restart_delay: 100,
      
      // Performance monitoring
      pmx: true,
      
      // Node.js specific options
      node_args: '--max-old-space-size=2048',
      
      // Graceful shutdown
      wait_ready: true,
      
      // Additional metadata
      vizion: true
    }
  ],

  // ===========================================================================
  // PM2 DEPLOYMENT CONFIGURATION (Optional - for automated deployments)
  // ===========================================================================
  deploy: {
    production: {
      user: 'zwicky',
      host: 'vm-zwickytechnology',
      ref: 'origin/main',
      repo: 'https://github.com/anandkanishkZ/lms.git',
      path: '/home/zwicky/lms',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build && cd ../frontend && npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': ''
    }
  }
};
