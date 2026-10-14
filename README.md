# Binz Life & Science website

A Next.js website with an admin panel. Everything on the public site is managed from the admin.

> **Status:** this code was written without being able to install packages or run it, so it has not been
> started yet. The SQL and data code was tested against SQLite and every file passes a syntax check, but
> expect to fix a small issue or two on the first run. If anything errors, send the message to Claude.

## Run it

You need **Node.js 20 or newer**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

1. Go to <http://localhost:3000/admin/signup> and create the first admin account.
2. Log in at <http://localhost:3000/admin/login>.

No setup file is needed for development. For a real server, copy `.env.example` to `.env.local` and set
`AUTH_SECRET` (see below).

## What the admin can manage

| Admin page | What it controls |
| --- | --- |
| **Menus** | Navigation menus. Each menu appears in the website header with its products listed underneath. Order, show/hide, delete. |
| **Products** | Create products inside a menu. Banner image, description, PDF files, Overview tab, Key Features tab, homepage featuring, publish/hide. |
| **Homepage** | Banner image and text, buttons, key numbers, introduction, products section titles, "why choose us" points, call to action. |
| **About Us** | Banner, story, mission, vision, values, call to action. |
| **Contact Us** | Address, phone, email, hours, optional Google map, form texts. Also used in the footer. |
| **Messages** | Messages sent through the Contact Us form. |
| **Settings** | **Theme switch (Agro Tech / Deep Soil)**, company name, **logo upload**, tagline, social links, change password. |

The product page follows the Corteva layout: banner image, then description with a PDF list and a
**Contact Us** button, then **Overview** and **Key Features** tabs.

## Text formatting in the admin

In description and overview boxes: a blank line starts a new paragraph, a line starting with `- ` becomes a
bullet, and a line starting with `## ` becomes a sub heading.

## Themes

Both themes are in `app/globals.css` at the top. Switching the theme in **Settings** changes colours, fonts
and corner style across the whole site. To adjust a colour, edit the variables under
`[data-theme='agrotech']` or `[data-theme='deepsoil']`.

## Sample content

The first run adds two sample menus and three sample products so the site is not empty. The homepage,
About and Contact pages also start with placeholder text, placeholder numbers (10+ years, 50+ products,
1000+ growers) and a placeholder address, phone and email. **Replace or delete all of these from the admin
before launching.** Deleting everything will not bring the samples back.

## Admin accounts and security

- The **first** admin can always sign up. After that, `/admin/signup` is closed. To allow more sign-ups,
  set `ALLOW_ADMIN_SIGNUP=true`, or create accounts from the command line:

  ```bash
  npm run create-admin -- you@example.com "a-strong-password" "Your Name"
  ```

  This also resets the password of an existing admin (useful if it is forgotten).
- Passwords are hashed with bcrypt. Login uses a signed, HTTP-only cookie that lasts 7 days.
- Uploads accept PNG, JPG, WebP, GIF and PDF only (max 20 MB), and the file contents are checked.

## Going live

```bash
npm run build
npm start
```

- Set `AUTH_SECRET` to a long random value:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use HTTPS in front of the site (Nginx, Caddy, or your host's proxy).
- The database and uploaded files live in the `data/` folder. **Back it up**, and keep it on a persistent
  disk. This project needs a normal Node server (VPS, Docker, Railway, Render and similar). It will not work
  on serverless hosts such as Vercel, because they cannot keep the `data/` folder.
- To store `data/` somewhere else, set `DATA_DIR`.

## Project layout

```
app/(site)/        public pages (home, about, contact, products)
app/admin/         login, signup and the admin panel
app/uploads/       serves uploaded images and PDFs
app/api/admin/     upload endpoint (admin only)
components/        site and admin components
lib/               database, auth, content defaults, server actions
scripts/           create-admin command
data/              created on first run: site.db and uploads/
```

## Not included

No cart, checkout or customer accounts, as requested. The contact form saves messages in the admin
(**Messages**) but does not send email notifications.
