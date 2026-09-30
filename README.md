# V.M. Kotagi Basava Samskruti School Website

**Basava Kendra's V.M. Kotagi Basava Samskruti School** — Hubballi, Karnataka.

---

## 🚀 How to Run (in VS Code)

1. **Open this folder in VS Code**
   - File → Open Folder → Select `vm-kotagi-school`

2. **Open Terminal** in VS Code (`Ctrl + backtick`)

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   - 🌐 School Website → http://localhost:3000
   - 🔐 Admin Panel  → http://localhost:3000/admin

---

## 🔐 Admin Login

| Field    | Value             |
|----------|-------------------|
| Username | `admin`           |
| Password | `admin@school123` |

> **Change the password** after first login via Admin Panel → Change Password

---

## 📁 Project Structure

```
vm-kotagi-school/
├── server.js          ← Start the backend here (npm start)
├── .env               ← Configuration (port, JWT secret)
├── database/
│   ├── db.js          ← Database setup
│   └── school.db      ← SQLite database file (auto-created)
├── routes/
│   ├── api.js         ← Public APIs
│   ├── admin.js       ← Admin panel APIs
│   └── auth.js        ← Login/logout
├── middleware/
│   └── auth.js        ← JWT authentication
├── public/            ← School website files
│   ├── index.html     ← Main website
│   ├── css/style.css
│   ├── js/
│   └── locales/       ← EN / KN / HI translations
└── views/admin/       ← Admin panel HTML pages
```

---

## 🌐 Languages

The public website supports 3 languages (click in the top navigation bar):
- 🇬🇧 **English** (default)
- 🇮🇳 **Kannada** (ಕನ್ನಡ)
- 🇮🇳 **Hindi** (हिन्दी)

---

## ⚙️ Admin Panel Features

| Page           | What you can do                              |
|----------------|----------------------------------------------|
| Dashboard      | See counts of all content at a glance        |
| Announcements  | Add/hide/delete news & events (in 3 languages) |
| Gallery        | Upload school photos (JPG/PNG)               |
| Staff          | Add/remove teacher profiles                  |
| Inquiries      | View parent admission inquiries, mark as read |

---

## 🔧 VS Code Extensions (Recommended)

Install these for a better experience:
- **SQLite Viewer** — Browse `database/school.db` visually inside VS Code
- **REST Client** — Test API endpoints from VS Code

---

## 📞 School Contact Info

- Phone: 9019054826 / 9449074231 / 9483474842
- Address: Murarji Nagar, 2nd Stage, Gokul Road, Hubballi – 580 027
