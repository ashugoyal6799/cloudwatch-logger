# CloudWatch Logger + Sentry

Production-ready Express app with centralized logging to AWS CloudWatch and error tracking with Sentry.

## Features

- ✅ Environment-aware logging (dev vs production)
- ✅ Structured JSON logs in CloudWatch
- ✅ Automatic request tracing with unique IDs
- ✅ IAM role-based authentication (no hardcoded keys)
- ✅ Daily log stream rotation
- ✅ Request performance tracking
- ✅ Sentry error tracking and monitoring

---

## Quick Start (Local Development)

```bash
npm install
npm start
```

This runs in development mode with console-only logging.

---

## Production Deployment on EC2

### Step 1: Create CloudWatch Log Group

1. Go to **AWS CloudWatch Console** → Logs → Log groups
2. Click **Create log group**
3. Name: `my-app-logs` (or your preferred name)
4. Click **Create**

---

### Step 2: Create IAM Role with CloudWatch Permissions

#### Option A: Using AWS Managed Policy (Easiest)

1. Go to **IAM Console** → Roles → **Create role**
2. **Trusted entity type:** AWS service
3. **Use case:** EC2
4. Click **Next**
5. **Add permissions:** Search and select **`CloudWatchAgentServerPolicy`**
6. Click **Next**
7. **Role name:** `EC2-CloudWatch-Role` (or your preferred name)
8. Click **Create role**

#### Option B: Using Custom JSON Policy

1. Go to **IAM Console** → Policies → **Create policy**
2. Click **JSON** tab
3. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Click **Next**
5. **Policy name:** `CloudWatchLogsAccess`
6. Click **Create policy**
7. Go to **Roles** → **Create role** → EC2 → Attach your new policy → Name it → **Create**

---

### Step 3: Attach IAM Role to EC2 Instance

1. Go to **EC2 Console** → Instances
2. Select your instance
3. **Actions** → **Security** → **Modify IAM role**
4. Select the role created in Step 2 (`EC2-CloudWatch-Role`)
5. Click **Update IAM role**

---

### Step 4: Configure Environment Variables

SSH into your EC2 instance and create `.env` file:

```bash
cd /path/to/your/app
nano .env
```

Add these variables:

```env
NODE_ENV=production
AWS_CLOUDWATCH_ENABLED=true
AWS_REGION=us-east-1
AWS_CLOUDWATCH_LOG_GROUP=my-app-logs
PORT=3000
```

**Important:**

- Replace `us-east-1` with your AWS region
- Replace `my-app-logs` with your log group name
- Do NOT add `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` (use IAM role)

---

### Step 5: Install Dependencies and Start App

```bash
# Install dependencies
npm install

# Start the application
npm start

```

---

### Step 6: Test Logging

```bash
# Generate test logs
curl http://localhost:3000/
curl http://localhost:3000/test/info
curl http://localhost:3000/test/warn
curl http://localhost:3000/test/error
curl http://localhost:3000/test/all

# Test Sentry error tracking
curl http://localhost:3000/debug-sentry
```

Wait 30-60 seconds, then check CloudWatch Console. You should see:

- Log group: `my-app-logs`
- Log stream: `app-YYYY-MM-DD` (e.g., `app-2025-10-16`)
- JSON formatted logs with trace IDs

## Sentry Setup (Optional)

Add to `.env`:

```env
SENTRY_DSN=your-sentry-dsn-here
```

Test: Visit `/debug-sentry` endpoint to trigger an error.

---

## License

MIT
