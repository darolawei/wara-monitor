# Deploy Wara Monitor

This app needs a Node.js server and PostgreSQL database. GitHub Pages cannot run it by itself.

## Render

1. Sign in to Render.
2. Choose **New > Blueprint**.
3. Connect the GitHub repository: `https://github.com/darolawei/wara-monitor`.
4. Select the `render.yaml` file from the repository root.
5. When Render asks for `DEFAULT_ADMIN_PASSWORD`, enter a private password you will use to sign in.
6. When Render asks for `SENSOR_API_KEY`, enter a private secret for ESP32 sensor uploads.
7. Apply the Blueprint and wait for the deploy to finish.

Render will create:

- `wara-monitor`, the web service
- `wara-monitor-db`, the PostgreSQL database

After deployment, open the `onrender.com` URL and sign in with:

- Username: `admin`
- Password: the `DEFAULT_ADMIN_PASSWORD` you entered during setup

Render automatically redeploys when changes are pushed to the `main` branch.

To connect a virtual or real ESP32 sensor, see [SENSOR_SETUP.md](./SENSOR_SETUP.md).
