Deploying your static site and making it searchable

1) Quick overview
- This workspace contains `home.html`, `contact.html`, `home.css`, and files to help search engines: `robots.txt` and `sitemap.xml`.
- To be discoverable by search engines, deploy the site to a public hosting provider and make sure `sitemap.xml` is accessible at your site root.

2) Customize before deploying
- Open `contact.html` and replace placeholder social URLs with your real profile links.
- Replace the email address in the mailto link if needed.
- Update `robots.txt` and `sitemap.xml` with your real domain.

3) Deploy options

GitHub Pages (free, simple):
- Create a public GitHub repo and push this folder (or the `gh-pages` branch).
- In the repo Settings → Pages, select the branch (main or gh-pages). GitHub will serve at `https://<your-username>.github.io/<repo>/`.

Netlify (recommended for static sites):
- Create a Netlify account, drag-and-drop the folder in the Netlify dashboard, or connect your Git repo and let Netlify auto-deploy.
- Netlify provides a public URL and automatically generates a sitemap if needed; you can set custom domain and SSL.

Vercel:
- Connect your Git repo in Vercel and deploy. Vercel also offers custom domains and automatic deployments.

4) After deployment
- Submit your sitemap to Google Search Console and Bing Webmaster Tools to speed up indexing.
- Share the site link on social media and other places to help discoverability.

5) Notes & next steps
- If you want friendly URLs (e.g., `/` instead of `/home.html`), use Netlify or Vercel rewrite rules or host from a root index.html.
- For advanced SEO: add page-specific meta tags, structured data (JSON-LD), and HTTPS using a custom domain.

6) View the site locally
If you want to preview the site in a browser on your computer, you can run a simple local static server.

Python 3 (built-in):
```powershell
# open a terminal in the project folder and run:
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Node (http-server):
```powershell
# install once: npm install -g http-server
# then run in the project folder:
http-server -p 8000
# open http://localhost:8000 in your browser
```

Notes:
- I added `index.html` which redirects to `home.html` so you can open the folder root in a browser.
- After deployment, update `robots.txt` and `sitemap.xml` with your real domain.
