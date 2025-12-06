import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart School LMS API',
      version: '1.0.0',
      description: `
        Comprehensive REST API for Smart School Learning Management System.
        
        ## Authentication
        Most endpoints require JWT authentication. Include the token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`
        
        ## Base URL
        Development: \`http://localhost:5000/api/v1\`
      `,
      contact: {
        name: 'Smart School Team',
        email: 'support@smartschool.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.smartschool.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization endpoints' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Modules', description: 'Learning module management' },
      { name: 'Topics', description: 'Module topics management' },
      { name: 'Lessons', description: 'Lesson content management' },
      { name: 'Enrollments', description: 'Student enrollment operations' },
      { name: 'Progress', description: 'Learning progress tracking' },
      { name: 'Exams', description: 'Examination management' },
      { name: 'Results', description: 'Exam results and grading' },
      { name: 'Resources', description: 'Learning resource management' },
      { name: 'Live Classes', description: 'Live class scheduling and management' },
      { name: 'Notices', description: 'Notice board and announcements' },
      { name: 'Notifications', description: 'User notification system' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'Classes', description: 'Class and section management' },
      { name: 'Subjects', description: 'Subject management' },
      { name: 'Activities', description: 'Activity tracking and history' },
      { name: 'Analytics', description: 'Analytics and reporting' },
    ],
  },
  // Path to the API docs
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../swagger.yaml'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
