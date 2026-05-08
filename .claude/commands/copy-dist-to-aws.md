Build locally then deploy .next/ to AWS EC2 and restart PM2.

```bash
npm run build && \
rm -rf .next/cache && \
scp -i ~/.ssh/my-back-end-key-pair.pem -r .next next.config.ts ubuntu@34.206.37.238:~/productivity-plogg-client/ && \
ssh -i ~/.ssh/my-back-end-key-pair.pem ubuntu@34.206.37.238 "cd ~/productivity-plogg-client && pm2 restart plog-frontend"
```
