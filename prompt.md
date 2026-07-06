# Zenith Vision API - VPS Deployment Guide (Port 8001)

This guide outlines the exact steps to deploy the new `vision_api.py` backend on your Ubuntu VPS. Since port 8000 is occupied by the live production (RenderZ) API, this new API will safely run on **Port 8001**. 

By the end of this guide, your new API will be running 24/7 in the background and accessible via a clean HTTPS URL or IP address, allowing your Next.js app (`fc-direct-6` branch) to pull data directly from it.

---

## Step 1: Upload the Code to the VPS
You need to get your `vision_api.py` and `requirements.txt` onto the VPS.
1. Commit your `vision_api.py` and `requirements.txt` (from the Zenith-app-Max folder) to a GitHub/GitLab repository.
2. SSH into your VPS:
   ```bash
   ssh blank@zenith-production
   ```
3. Clone your code into a new folder for the vision API:
   ```bash
   git clone https://github.com/yourusername/your-repo.git /home/blank/vision-api
   cd /home/blank/vision-api
   ```

---

## Step 2: Set Up Python Environment
We need to install the dependencies in an isolated virtual environment.

1. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install the necessary packages:
   ```bash
   pip install -r requirements.txt
   ```
   *(Ensure that `fastapi`, `uvicorn`, `gunicorn`, and `psycopg2-binary` are installed).*

3. Set up your database connection:
   ```bash
   nano .env
   ```
   Add your database credentials to the `.env` file so `vision_api.py` can connect to your new `vision_players` tables.

---

## Step 3: Create a Systemd Service (Run Forever)
To keep the API running in the background (even after you close the SSH terminal) and automatically restart it on server reboots, we use `systemd`.

1. Create a new service file:
   ```bash
   sudo nano /etc/systemd/system/visionapi.service
   ```
2. Paste the following configuration exactly. Notice the `--bind 127.0.0.1:8001` at the end:
   ```ini
   [Unit]
   Description=Gunicorn instance to serve Zenith Vision API
   After=network.target

   [Service]
   User=blank
   Group=www-data
   WorkingDirectory=/home/blank/vision-api
   Environment="PATH=/home/blank/vision-api/venv/bin"
   EnvironmentFile=/home/blank/vision-api/.env

   # Run FastAPI with 4 worker processes for high performance on Port 8001
   ExecStart=/home/blank/vision-api/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker vision_api:app --bind 127.0.0.1:8001

   [Install]
   WantedBy=multi-user.target
   ```
3. Save and close the file (`Ctrl+O`, `Enter`, `Ctrl+X`).
4. Start and enable the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start visionapi
   sudo systemctl enable visionapi
   ```
5. Check if it's running smoothly:
   ```bash
   sudo systemctl status visionapi
   ```

---

## Step 4: Expose the API to the Internet via Nginx
Right now, the API is running locally on the VPS at `127.0.0.1:8001`. We need Nginx to act as a reverse proxy so the outside world can access it.

1. Create a new Nginx configuration block:
   ```bash
   sudo nano /etc/nginx/sites-available/visionapi
   ```
2. Paste the following block. Replace `api-v2.zenithfcm.com` with the actual subdomain you want to use (or your VPS IP address if you aren't using a domain yet).
   ```nginx
   server {
       listen 80;
       server_name api-v2.zenithfcm.com; # <--- Update this to your desired subdomain

       location / {
           proxy_pass http://127.0.0.1:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Save the file.
4. Enable the new site by linking it:
   ```bash
   sudo ln -s /etc/nginx/sites-available/visionapi /etc/nginx/sites-enabled/
   ```
5. Test the Nginx configuration to make sure there are no typos:
   ```bash
   sudo nginx -t
   ```
6. Restart Nginx to apply changes:
   ```bash
   sudo systemctl restart nginx
   ```

---

## Step 5: Secure with HTTPS (Free SSL)
If you used a real domain name (like `api-v2.zenithfcm.com`), secure it using Certbot.

```bash
sudo certbot --nginx -d api-v2.zenithfcm.com
```
Certbot will automatically modify your Nginx file to support HTTPS.

---

## Step 6: Connect Your Next.js App
Now that your API is live and secure, you can access your data! 

Go to your local Windows machine, open your `.env` file in the `Zenith-app-Max` (`fc-direct-6` branch), and update the API URL:

```env
ZENITH_API_BASE_URL=https://api-v2.zenithfcm.com
```
*(If you didn't set up a domain, use `http://YOUR_VPS_IP` instead, but you will need to open port 80 in your firewall).*

Restart your `npm run dev` server locally. Your frontend is now successfully pulling traits, stats, and player data entirely from your new production-ready Vision API on Port 8001!
