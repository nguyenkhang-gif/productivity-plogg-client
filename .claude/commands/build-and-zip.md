Build Next.js, xóa cache, và zip thư mục .next/ để chuẩn bị deploy.

```bash
npm run build && \
rm -rf .next/cache && \
zip -r next-dist.zip .next next.config.ts package.json && \
echo "Done! File: next-dist.zip ($(du -sh next-dist.zip | cut -f1))"
```
