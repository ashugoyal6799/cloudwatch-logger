# CloudWatch Logger

Express app testing CloudWatch logging on EC2.

## Quick Start

```bash
npm install
cp .env.example .env
npm start
```

## Environment Variables

```env
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_CLOUDWATCH_ENABLED=true
```

## IAM Permissions

Attach to EC2 instance role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:ap-south-1:*:log-group:app-logs:*"
    }
  ]
}
```

## Create Log Group

```bash
aws logs create-log-group --log-group-name app-logs --region ap-south-1
```

## Test Endpoints

```bash
curl http://localhost:3000/test/info
curl http://localhost:3000/test/warn
curl http://localhost:3000/test/error
curl http://localhost:3000/test/all
curl http://localhost:3000/test/metadata
curl http://localhost:3000/test/throw-error
```

## Production Deployment

```bash
npm install -g pm2
pm2 start app.js --name cloudwatch-logger
pm2 startup
pm2 save
```

## Troubleshooting

**Logs not appearing?**

- Verify IAM permissions: `aws logs describe-log-groups --region ap-south-1`
- Check `.env` has `AWS_CLOUDWATCH_ENABLED=true`
- Verify log group exists in AWS Console

**AccessDeniedException?**

- Add CloudWatch permissions to IAM role
