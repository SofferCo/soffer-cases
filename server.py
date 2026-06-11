import http.server
import os
import socketserver
from functools import partial

PORT = 4322
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


Handler = partial(NoCacheHandler, directory=DIRECTORY)
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving {DIRECTORY} on http://localhost:{PORT}")
    httpd.serve_forever()
