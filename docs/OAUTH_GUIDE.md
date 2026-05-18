# OAuth Login — Google & Facebook

## Luồng tổng quát

```
User click "Google" / "Facebook"
  → Redirect tới backend: GET /api/auth/google
  → Passport.js khởi tạo OAuth flow, redirect tới Google/Facebook
  → User đồng ý → Google/Facebook gọi callback về backend
  → Backend: GET /api/auth/google/callback
      1. Passport validate profile (email, name, providerId)
      2. OAuthLoginUseCase: find-or-create user trong DB
      3. Ký JWT
      4. Redirect → {FRONTEND_URL}/auth/callback?token=<jwt>
  → Frontend /auth/callback page:
      1. Đọc ?token= từ URL
      2. Lưu vào localStorage
      3. GET /auth/profile → dispatch setCredentials vào Redux
      4. router.replace("/posts")
```

---

## Frontend

### Files đã implement

| File | Vai trò |
|---|---|
| `src/components/auth/sign-in-card.tsx` | Nút Google/Facebook → `<a href="API_URL/auth/google">` |
| `src/components/auth/sign-up-card.tsx` | Nút Google/Facebook → `<a href="API_URL/auth/facebook">` |
| `src/app/auth/callback/page.tsx` | Nhận `?token=`, lưu JWT, fetch profile, redirect `/posts` |
| `src/core/config/routes.ts` | `/auth/callback` là `public` để route guard không chặn |

### Callback page logic (`/auth/callback`)

```ts
const token = searchParams.get("token");

// Lưu token
localStorage.setItem("token", token);
axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Fetch profile → Redux
const { data: profile } = await axiosInstance.get("/auth/profile");
dispatch(setCredentials({ profile, token }));

router.replace("/posts");
```

---

## Backend (cần implement)

### Files cần tạo mới

| File | Vai trò |
|---|---|
| `strategies/google.strategy.ts` | Passport GoogleStrategy, extract profile từ OAuth |
| `strategies/facebook.strategy.ts` | Passport FacebookStrategy, extract profile từ OAuth |
| `use-case/auth/oauth-login.use-case.ts` | Find-or-create user, liên kết account, trả JWT |
| `domain/interfaces/oauth-profile.interface.ts` | Interface `OAuthProfile` dùng chung cho Google/Facebook |

### Files cần sửa

| File | Thay đổi |
|---|---|
| `schemas/user.schema.ts` | Thêm `googleId`, `facebookId`, `provider`; bỏ `required` trên `passwordHash` và `gender` |
| `domain/entities/user.entity.ts` | Thêm field `googleId?`, `facebookId?`, `provider?` |
| `repositories/user.repository.interface.ts` | Thêm `findByGoogleId()`, `findByFacebookId()` |
| `repositories/user.repository.ts` | Implement 2 method trên |
| `controllers/auth.controller.ts` | Thêm 4 routes OAuth |
| `auth.module.ts` | Đăng ký `GoogleStrategy`, `FacebookStrategy`, `OAuthLoginUseCase` |

---

## Account linking logic

```
OAuthLoginUseCase.execute(profile: OAuthProfile):

1. Tìm user theo googleId / facebookId (tùy provider)
2. Không tìm thấy → tìm theo email
3. Vẫn không có → tạo user mới
       passwordHash = ""
       gender = "other"
       username = displayName hoặc displayName + "_abc123" (nếu trùng)
4. Tìm thấy qua email nhưng chưa có providerId → gắn providerId vào (account linking)
5. Ký JWT → trả { access_token }
```

---

## Controller routes

```ts
// Google
@Get('google')
@UseGuards(AuthGuard('google'))
googleAuth() {}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleCallback(@Request() req, @Res() res) {
  const { access_token } = await this.oauthLoginUseCase.execute(req.user);
  res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
}

// Facebook
@Get('facebook')
@UseGuards(AuthGuard('facebook'))
facebookAuth() {}

@Get('facebook/callback')
@UseGuards(AuthGuard('facebook'))
async facebookCallback(@Request() req, @Res() res) {
  const { access_token } = await this.oauthLoginUseCase.execute(req.user);
  res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
}
```

---

## Env vars

### Backend `.env`

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/auth/facebook/callback

FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Packages cần cài (Backend)

```bash
npm i passport-google-oauth20 passport-facebook
npm i -D @types/passport-google-oauth20 @types/passport-facebook
```

---

## Lưu ý

- **Facebook** yêu cầu HTTPS cho callback URL ở production. Local dev dùng `http://` được nếu app mode = Development trên Facebook Developer Console.
- **Google** cần verify app cho production. Dev mode chỉ cho phép test users đã được thêm vào danh sách trong Google Cloud Console.
- User tạo qua OAuth **không có password** (`passwordHash = ""`). Muốn đăng nhập bằng email/password phải tự set password sau.
