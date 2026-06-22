import sqlite3

class ItemSharingDatabase:
    def __init__(self, db_name):
        self.db_name = db_name
        self.create_tables()

    def _get_connection(self):
        return sqlite3.connect(self.db_name)

    def create_tables(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                grade INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                item_name TEXT CHECK(item_name IN (
                    'scissors', 'backpack', 'pen', 'pencil', 'calculator', 
                    'notebook', 'eraser', 'ruler', 'sharpener', 'water_bottle'
                )),
                status TEXT CHECK(status IN ('offering', 'searching')),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        ''')
        conn.commit()
        conn.close()

    def add_user(self, email, name, grade):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (email, name, grade) VALUES (?, ?, ?)', (email, name, grade))
        conn.commit()
        conn.close()

    def add_item(self, user_email, item_name, status):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO items (user_email, item_name, status) 
            VALUES (?, ?, ?)
        ''', (user_email, item_name.lower(), status.lower()))
        conn.commit()
        conn.close()

    def find_matches(self, user_email):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                u.email AS peer_email,
                u.name AS peer_name,
                u.grade AS peer_grade,
                i1.item_name AS item,
                i1.status AS my_status,
                i2.status AS peer_status
            FROM items i1
            JOIN items i2 ON i1.item_name = i2.item_name AND i1.status != i2.status
            JOIN users u ON i2.user_email = u.email
            WHERE i1.user_email = ?
        ''', (user_email,))
        
        matches = cursor.fetchall()
        conn.close()
        return matches
    
    def get_user(self, user_email):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (user_email,))
        user = cursor.fetchone()
        conn.close()
        return user