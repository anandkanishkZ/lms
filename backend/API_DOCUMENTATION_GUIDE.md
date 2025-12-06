# 📚 API Documentation - Swagger UI Integration

## 🌐 Access API Documentation

Your API documentation is now integrated directly into your backend server using **Swagger UI**.

### 🚀 Live Documentation URLs

Once your backend server is running:

- **📖 Interactive Swagger UI**: http://localhost:5000/api/docs
- **📄 JSON Specification**: http://localhost:5000/api/docs.json
- **🏥 Health Check**: http://localhost:5000/api/health

### Production URLs

- **📖 Swagger UI**: https://your-domain.com/api/docs
- **📄 JSON Spec**: https://your-domain.com/api/docs.json

---

## 🎯 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

### 2. Open Swagger UI

Visit: http://localhost:5000/api/docs

You'll see a beautiful, interactive API documentation interface with:
- ✅ 60+ documented endpoints
- ✅ Try-it-out functionality
- ✅ Request/response examples
- ✅ Schema definitions
- ✅ Authentication support
- ✅ Search and filter

---

## 🔐 Testing APIs with Authentication

### Step 1: Login

1. Open Swagger UI: http://localhost:5000/api/docs
2. Find the **Authentication** section
3. Click on `POST /auth/login`
4. Click **"Try it out"**
5. Enter credentials:
   ```json
   {
     "email": "student@lms.com",
     "password": "student123"
   }
   ```
6. Click **"Execute"**
7. Copy the `token` from the response

### Step 2: Authorize

1. Click the **"Authorize"** button (🔓 icon at the top right)
2. In the dialog, enter: `Bearer <your-token>`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Endpoints

Now you can test any protected endpoint:
1. Click on any endpoint (e.g., `GET /modules`)
2. Click **"Try it out"**
3. Fill in any required parameters
4. Click **"Execute"**
5. View the response

---

## 📋 Features

### Interactive Testing
- **Try It Out**: Test every endpoint directly from the browser
- **Real Responses**: See actual API responses with data
- **Error Handling**: View error messages and status codes
- **Request Preview**: See the exact request being sent

### Documentation Quality
- **Detailed Descriptions**: Each endpoint has clear descriptions
- **Request Schemas**: See exactly what data to send
- **Response Examples**: View sample responses
- **Parameter Details**: Know what each parameter does
- **Status Codes**: Understand all possible responses

### Developer Experience
- **Search**: Quickly find endpoints
- **Filter**: Focus on specific tags/categories
- **Expand/Collapse**: Navigate easily through sections
- **Copy**: Copy example requests with one click
- **Persist Auth**: Token saved in browser session

---

## 📁 File Structure

```
backend/
├── src/
│   ├── swagger.yaml          # OpenAPI 3.0 specification
│   ├── config/
│   │   └── swagger.ts        # Swagger configuration
│   └── server.ts             # Express server (Swagger integrated)
└── package.json              # Dependencies
```

---

## 🛠️ Technical Implementation

### Dependencies Installed

```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.1",
    "swagger-jsdoc": "^6.2.8",
    "yamljs": "^0.3.0"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.6",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/yamljs": "^0.2.34"
  }
}
```

### Server Integration

In `backend/src/server.ts`:

```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Swagger UI setup
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 30px 0 }
  `,
  customSiteTitle: 'Smart School LMS API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
};

// Routes
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerDocument, swaggerUiOptions));
app.get('/api/docs.json', (req, res) => res.send(swaggerDocument));
```

---

## 📝 API Categories

The documentation is organized into these categories:

### 🔐 Authentication (8 endpoints)
- Register, Login, Logout
- Profile management
- Password change
- Avatar upload

### 📚 Modules (10 endpoints)
- CRUD operations
- Approval workflow
- Publishing system

### 📖 Topics & Lessons (12 endpoints)
- Topic management
- Lesson content
- Ordering system

### 🎓 Enrollments (4 endpoints)
- Student enrollment
- Progress tracking
- Course access

### 📋 Exams (8 endpoints)
- Exam creation
- Student submissions
- Grading system

### 📁 Resources (5 endpoints)
- File uploads
- Resource management
- Download tracking

### 🎥 Live Classes (5 endpoints)
- YouTube Live integration
- Scheduling
- Status management

### 📢 Notices (5 endpoints)
- Announcements
- Categories
- Targeting

### 👨‍💼 Admin (10+ endpoints)
- User management
- Batch operations
- Analytics
- System settings

---

## 🔄 Updating Documentation

### Method 1: Update YAML File

Edit `backend/src/swagger.yaml` directly:

```yaml
paths:
  /api/v1/your-new-endpoint:
    get:
      tags: [Your Tag]
      summary: Your endpoint description
      responses:
        '200':
          description: Success response
```

### Method 2: Use JSDoc Comments

In your route files:

```typescript
/**
 * @swagger
 * /api/v1/modules:
 *   get:
 *     tags: [Modules]
 *     summary: Get all modules
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/modules', moduleController.getAll);
```

After updating, restart the server to see changes.

---

## 🌐 Production Deployment

### Environment Variables

Add to your `.env` file:

```env
# API Documentation
API_BASE_URL=https://api.yourcompany.com/api/v1
NODE_ENV=production
```

### Security Considerations

**Option 1: Public Documentation**
```typescript
// Keep as is - documentation accessible to everyone
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerDocument));
```

**Option 2: Protected Documentation (Recommended for Production)**
```typescript
// Add authentication middleware
import { authenticateToken, authorizeRoles } from './middlewares/auth';

app.use('/api/docs', authenticateToken, authorizeRoles(['ADMIN']), swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerDocument));
```

**Option 3: Disable in Production**
```typescript
// Only enable in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(swaggerDocument));
}
```

---

## 📊 Example Workflows

### Workflow 1: Student Enrollment

```
1. POST /auth/login
   → Get JWT token

2. GET /modules
   → Browse available modules

3. POST /enrollments
   → Enroll in a module
   Body: { "moduleId": "...", "studentId": "..." }

4. GET /modules/{id}
   → View module content

5. POST /progress/lessons/{id}
   → Mark lessons as complete
```

### Workflow 2: Teacher Creating Module

```
1. POST /auth/login (as teacher)
   → Get JWT token

2. POST /modules
   → Create new module
   Body: { "title": "...", "description": "...", ... }

3. POST /topics
   → Add topics to module

4. POST /lessons
   → Add lessons to topics

5. POST /modules/{id}/submit
   → Submit for admin approval
```

### Workflow 3: Exam Flow

```
Teacher:
1. POST /exams
   → Create exam

2. Add questions in request body

3. Publish exam

Student:
1. GET /exams
   → View available exams

2. POST /exams/{id}/submit
   → Submit answers

Teacher:
3. POST /exams/{id}/grade
   → Grade exam

Student:
4. GET /exams/{id}/result
   → View result
```

---

## 🎨 Customization

### Custom Styling

Edit in `server.ts`:

```typescript
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .swagger-ui .info .title { 
      color: #667eea;
      font-size: 42px;
    }
  `,
  customSiteTitle: 'Your Custom Title',
  customfavIcon: '/your-favicon.ico',
};
```

### Custom Logo

```typescript
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar-wrapper img {
      content: url('/your-logo.png');
    }
  `,
};
```

---

## 🐛 Troubleshooting

### Issue: Swagger UI not loading

**Solution 1**: Check if server is running
```bash
curl http://localhost:5000/api/health
```

**Solution 2**: Check swagger.yaml exists
```bash
ls backend/src/swagger.yaml
```

**Solution 3**: Check for TypeScript errors
```bash
cd backend
npm run build
```

### Issue: Cannot test endpoints (401 Unauthorized)

**Solution**: Make sure you've authorized with a valid JWT token:
1. Login via `/auth/login`
2. Click "Authorize" button
3. Enter: `Bearer <your-token>`

### Issue: Changes not reflecting

**Solution**: Restart the server
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## 📦 Export Options

### Export as Postman Collection

1. Visit: http://localhost:5000/api/docs.json
2. Copy the JSON
3. In Postman: File → Import → Raw Text
4. Paste JSON → Import

### Export as Insomnia Collection

Same process as Postman - Insomnia supports OpenAPI 3.0

### Share with Frontend Team

Simply share the URL:
- **Development**: http://localhost:5000/api/docs
- **Production**: https://your-api.com/api/docs

---

## 🎓 Best Practices

1. **Keep Documentation Updated**: Update swagger.yaml when adding/modifying endpoints
2. **Use Descriptive Names**: Clear endpoint names and descriptions
3. **Include Examples**: Add request/response examples for all endpoints
4. **Document Errors**: List all possible error responses
5. **Version Your API**: Use versioning in URLs (`/api/v1`, `/api/v2`)
6. **Secure Production Docs**: Protect docs in production or disable them
7. **Test Before Deploy**: Always test documentation locally first

---

## 📞 Support

Need help? Check these resources:

- 📖 Swagger UI Docs: https://swagger.io/docs/
- 📖 OpenAPI Spec: https://swagger.io/specification/
- 🐛 Issues: Create an issue in the GitHub repository
- 📧 Email: support@smartschool.com

---

## 🎉 You're All Set!

Your API documentation is now live and integrated into your backend server. Visit http://localhost:5000/api/docs to explore!

**Happy API Development! 🚀**
