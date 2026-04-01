import traceback
import sys

try:
    from app.main import app
    print("BACKEND OK")
except Exception as e:
    traceback.print_exc()
    with open("import_error.log", "w") as f:
        traceback.print_exc(file=f)
    print(f"FAILED: {e}")
