import http.server
import json
import os

PORT = 8000
CONFIG_FILE = 'menu_config.json'

class MenuRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API endpoint to load configurations
        if self.path == '/api/config':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(json.dumps({}).encode('utf-8'))
        else:
            # Fallback to serving static files (index.html, style.css, app.js, images, etc.)
            super().do_GET()

    def do_POST(self):
        # API endpoint to save configurations
        if self.path == '/api/config':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                # Validate JSON format
                data = json.loads(post_data.decode('utf-8'))
                
                # Write to disk
                with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
                print("Configuration saved successfully.")
            except Exception as e:
                print(f"Error saving configuration: {e}")
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        # Enable CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Add a custom mime mapping for WebP files to ensure correct content types
    import mimetypes
    mimetypes.add_type('image/webp', '.webp')
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, MenuRequestHandler)
    print(f"Server is running at: http://localhost:{PORT}/")
    print("Use Ctrl+C to terminate.")
    httpd.serve_forever()
