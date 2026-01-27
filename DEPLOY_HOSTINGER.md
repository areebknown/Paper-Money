# Deploying Paper Money UPI to Hostinger

Since this application uses a database (SQLite) and API routes (Next.js server-side features), it requires a **Node.js environment**. It **cannot** run on standard "Shared Web Hosting" that only supports PHP/HTML.

You must have:
-   **VPS Hosting** (Virtual Private Server) - Recommended.
-   OR **Cloud Startup Plan** (or similar plans with Node.js support).

## Prerequisites

1.  **Node.js**: Ensure Node.js (v18+) is installed on your server.
2.  **PM2**: A process manager to keep your app running.
    ```bash
    npm install -g pm2
    ```

## Step-by-Step Deployment (VPS)

### 1. Build the App Locally
Run these commands in your project folder to create a production build.
```bash
npm run build
```
This creates a `.next` folder.

### 2. Prepare for Upload
You need to upload the following files/folders to your server (e.g., via SFTP/FileZilla or Git):
-   `.next` (Folder)
-   `public` (Folder)
-   `package.json`
-   `next.config.ts` (or .js)
-   `prisma` (Folder - needed for db schema)
-   `.env` (Create this on the server with your production secrets)

### 3. Server Setup (SSH into your VPS)

#### A. Install Dependencies
Navigate to your uploaded app directory on the server:
```bash
cd /path/to/your/app
npm install --production
```

#### B. Setup Database
Initialize the SQLite database on the server:
```bash
npx prisma generate
npx prisma db push
```

#### C. Create .env File
```bash
nano .env
```
Paste your environment variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secure-secret-key-change-this"
NODE_ENV="production"
```
Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 4. Start the Application
Use PM2 to start the app so it runs in the background.
```bash
pm2 start npm --name "paper-pay" -- start
```
Your app should now be running on port 3000 (default).

### 5. Setup Nginx (Reverse Proxy)
To access your app via a domain (e.g., `paperpay.com`) instead of `IP:3000`, you need Nginx.

1.  Install Nginx: `sudo apt install nginx`
2.  Create config: `sudo nano /etc/nginx/sites-available/paperpay`
3.  Add configuration:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
4.  Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/paperpay /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Troubleshooting
-   **App Crashing?**: Check logs with `pm2 logs paper-pay`.
-   **Database Error?**: Ensure `dev.db` has write permissions (`chmod 664 dev.db` and ensure the folder is writable).
-   **Port in Use?**: Check if something else is using port 3000.
