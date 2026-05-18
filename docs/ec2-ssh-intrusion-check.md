# Kiểm tra EC2 bị SSH trái phép

## 1. Kiểm tra phiên SSH đang active

```bash
# Xem ai đang login hiện tại
who
w

# Xem tất cả session đang mở
ss -tnp | grep :22

# Kiểm tra process lạ chạy bởi user không quen
ps aux | grep -v "$(whoami)\|root\|systemd\|sshd\|www-data"
```

---

## 2. Kiểm tra lịch sử đăng nhập

```bash
# Đăng nhập thành công gần đây
last -n 50

# Đăng nhập thất bại (brute force)
lastb -n 50

# Hoặc đọc auth log trực tiếp
sudo grep "Accepted\|Failed\|Invalid" /var/log/auth.log | tail -100

# Lọc IP lạ đã đăng nhập thành công
sudo grep "Accepted password\|Accepted publickey" /var/log/auth.log
```

---

## 3. Kiểm tra IP nguồn đáng ngờ

```bash
# Xem IP nào đã SSH thành công
sudo grep "Accepted" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn

# IP đang kết nối SSH hiện tại
ss -tnp | grep ESTABLISHED | grep :22

# Netstat (nếu có)
netstat -tnp | grep :22
```

---

## 4. Kiểm tra authorized_keys bị sửa

```bash
# Xem key nào được phép login
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys

# Kiểm tra thời gian sửa file gần đây
ls -la ~/.ssh/
stat ~/.ssh/authorized_keys
```

---

## 5. Kiểm tra user/account lạ

```bash
# Tất cả user có shell login
cat /etc/passwd | grep -v "nologin\|false"

# User nào được thêm gần đây (sắp xếp theo thời gian)
ls -lt /home/

# Kiểm tra sudo access
cat /etc/sudoers
sudo cat /etc/sudoers.d/*

# User nào đang ở group sudo/admin
getent group sudo
getent group admin
```

---

## 6. Kiểm tra file bị sửa gần đây

```bash
# File nào bị thay đổi trong 24h qua (toàn hệ thống)
find / -mtime -1 -type f 2>/dev/null | grep -v "/proc\|/sys\|/dev\|/run"

# Tập trung vào các thư mục nhạy cảm
find /etc /usr/bin /usr/sbin /home /root -mtime -3 -type f 2>/dev/null

# Kiểm tra crontab lạ (persistence backdoor)
crontab -l
sudo crontab -l
cat /etc/cron* 2>/dev/null
ls /etc/cron.d/ /etc/cron.daily/
```

---

## 7. Kiểm tra process và network đáng ngờ

```bash
# Process đang lắng nghe cổng lạ
ss -tlnp

# Process dùng nhiều CPU/RAM bất thường (cryptominer)
top -bn1 | head -20
ps aux --sort=-%cpu | head -20

# Kết nối ra ngoài đang active
ss -tnp | grep ESTABLISHED
```

---

## 8. Kiểm tra AWS CloudTrail & Security Groups

Trên AWS Console:

1. **CloudTrail** → Event history → lọc `ConsoleLogin`, `AuthorizeSecurityGroupIngress`
2. **EC2** → Security Groups → kiểm tra rule nào mở port 22 cho `0.0.0.0/0`
3. **IAM** → xem API key nào được dùng gần đây
4. **VPC Flow Logs** → traffic bất thường vào/ra instance

---

## 9. Hành động ngay nếu phát hiện xâm nhập

```bash
# 1. Ngắt kết nối IP lạ ngay lập tức
sudo iptables -A INPUT -s ATTACKER_IP -j DROP

# 2. Xóa key lạ khỏi authorized_keys
nano ~/.ssh/authorized_keys

# 3. Đổi port SSH (mặc định 22)
sudo nano /etc/ssh/sshd_config
# Sửa: Port 2222
sudo systemctl restart sshd

# 4. Tắt password login, chỉ dùng key
# PasswordAuthentication no
# PermitRootLogin no
```

---

## 10. Phòng ngừa lâu dài

| Biện pháp | Lệnh / Config |
|---|---|
| Fail2ban | `sudo apt install fail2ban` |
| Giới hạn IP SSH | Security Group chỉ cho IP của bạn |
| Disable root login | `PermitRootLogin no` trong sshd_config |
| MFA cho SSH | `libpam-google-authenticator` |
| AWS Systems Manager | SSH không cần mở port 22 |
