import sqlite3
from passlib.hash import sha256_crypt

def run():
    conn = sqlite3.connect('shadow_map_v2.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT,
        is_active BOOLEAN DEFAULT 1
    )
    ''')
    
    email = "operator@resilience.lab"
    password = "admin123"
    hashed = sha256_crypt.hash(password)
    
    try:
        cursor.execute("INSERT INTO users (email, hashed_password, role) VALUES (?, ?, ?)", 
                      (email, hashed, 'operator'))
        conn.commit()
        print(f"SUCCESS: Created user {email} with password {password}")
    except sqlite3.IntegrityError:
        # Update password for existing user
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = ?", (hashed, email))
        conn.commit()
        print(f"SUCCESS: Updated user {email} with password {password}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    run()
