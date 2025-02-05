# Setup deps
setup:
    brew install caddy
    npm install -g @tailwindcss/cli tailwindcss

# Start caddy server with local caddyfile
serve:
    caddy start

# Run tailwind watcher
css:
    npx @tailwindcss/cli -i ./lib/styles.css -o ./lib/styles.min.css --watch --minify

# Run caddy server and tailwind watcher
dev:
    just serve & just css
