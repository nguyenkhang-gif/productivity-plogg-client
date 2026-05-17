Build locally then deploy .next/ to AWS EC2 and restart PM2.

```bash
scp -i ~/.ssh/my-back-end-key-pair.pem next-dist.zip ubuntu@107.21.107.160:~/frontend/ && \
ssh -i ~/.ssh/my-back-end-key-pair.pem ubuntu@107.21.107.160 "cd ~/frontend && unzip -o next-dist.zip && rm next-dist.zip && pm2 restart frontend"
```
