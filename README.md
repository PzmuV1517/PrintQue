PrintQue

Simple print-queue web app with a FastAPI backend and a React + Vite frontend.

What you get
- Backend API (FastAPI) for queueing print jobs and managing uploads
- Frontend (React) with pages for Queue, New Request, and Admin
- Basic-Auth protected admin actions: download and delete

Repo layout
- backend/ — FastAPI app (uvicorn)
- frontend/PrintQue — Vite + React app

Quick start (local dev)
1) Backend
	 - Requirements: Python 3.11+ recommended
	 - From backend/ install and run:
		 - pip install -r requirements.txt
		 - uvicorn app.main:app --reload --port 5420
	 - Health check: http://127.0.0.1:5420/health

2) Frontend
	 - Requirements: Node 18+ (or 20+)
	 - From frontend/PrintQue/ install and run:
		 - npm install
		 - npm run dev
	 - App: http://127.0.0.1:5173
	 - By default the frontend calls the API at /api. For local separate ports, set an env var when starting Vite:
		 - VITE_API_BASE=http://127.0.0.1:5420 npm run dev

Admin login
- HTTP Basic credentials (fixed in code):
	- user: qradmin
	- pass: kickathon
- Login from the Admin page and then download/delete jobs.

API overview
- GET /health — service status
- GET /queue — list jobs (public)
- POST /queue — create job (multipart form: team, contact, comments?, specs?, file)
- GET /queue/{id}/download — admin basic-auth download
- DELETE /queue/{id} — admin basic-auth delete

Accepted file types
- .stl, .obj, .step, .stp, .ply, .gltf, .glb, .fbx, .dae, .3ds, .amf, .3mf

Production hosting on a domain
Goal: serve the frontend at https://scoreboard.example.site and proxy API under https://scoreboard.example.site/api.

High-level
- Build the frontend into static files
- Run the FastAPI backend (uvicorn or gunicorn) on an internal port (e.g., 5420)
- Put Nginx (or similar) in front to:
	- serve the built frontend (from dist/)
	- reverse proxy /api to the backend
	- enable HTTPS (e.g., with certbot/Let’s Encrypt)

Build frontend
- From frontend/PrintQue:
	- npm install
	- VITE_API_BASE=/api npm run build
	- Output: frontend/PrintQue/dist

Run backend (systemd example)
- Create a systemd service (adjust paths and Python env):
	- /etc/systemd/system/printque.service
		[Unit]
		Description=PrintQue FastAPI
		After=network.target

		[Service]
		WorkingDirectory=/srv/PrintQue/backend
		ExecStart=/usr/bin/env uvicorn app.main:app --host 127.0.0.1 --port 5420
		Restart=always
		User=www-data
		Group=www-data
		Environment=PYTHONUNBUFFERED=1

		[Install]
		WantedBy=multi-user.target

- Reload and start:
	- sudo systemctl daemon-reload
	- sudo systemctl enable --now printque
	- Verify: curl http://127.0.0.1:5420/health

Nginx site config (example)
- /etc/nginx/sites-available/scoreboard.example.site
	server {
			listen 80;
			server_name scoreboard.example.site;

			# Serve built frontend
			root /srv/PrintQue/frontend/PrintQue/dist;
			index index.html;

			# Frontend routing (spa)
			location / {
					try_files $uri /index.html;
			}

			# API reverse proxy
			location /api/ {
					proxy_pass http://127.0.0.1:5420/;
					proxy_set_header Host $host;
					proxy_set_header X-Real-IP $remote_addr;
					proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
					proxy_set_header X-Forwarded-Proto $scheme;
			}
	}

- Enable and test:
	- sudo ln -s /etc/nginx/sites-available/scoreboard.example.site /etc/nginx/sites-enabled/
	- sudo nginx -t
	- sudo systemctl reload nginx
	- Optional: Set up HTTPS with certbot (Let’s Encrypt)

Environment and config
- Frontend:
	- VITE_API_BASE controls where requests go
		- For same-origin proxy: VITE_API_BASE=/api (recommended)
		- For direct backend: VITE_API_BASE=https://scoreboard.example.site/api (also fine)
- Backend:
	- CORS in app/main.py currently allows only localhost. If you plan to call the backend directly from the browser on the domain, add https://scoreboard.example.site to allow_origins. When using same-origin /api via Nginx, no CORS change is needed.

Useful dev commands
- Backend (from backend/):
	- pip install -r requirements.txt
	- uvicorn app.main:app --reload --port 5420
- Frontend (from frontend/PrintQue/):
	- npm install
	- npm run dev
	- VITE_API_BASE=http://127.0.0.1:5420 npm run dev

Notes and tips
- Uploads are stored on disk under backend/uploads. The in-memory queue resets on restart.
- If serving behind a different path than /api, set VITE_API_BASE to that path and update Nginx accordingly.
- Admin credentials are hard-coded. For production, consider moving to env vars and HTTPS only.
