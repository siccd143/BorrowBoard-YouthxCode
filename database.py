import sqlite3
import secrets

class ItemSharingDatabase:
    def __init__(self, db_name):
        self.db_name = db_name
        self.create_tables()

    def _get_connection(self):
        """Helper method to return a fresh connection context."""
        return sqlite3.connect(self.db_name)

    def create_tables(self):
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                grade INTEGER,
                trust_score INTEGER DEFAULT 100
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS school_schedules (
                schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                day_of_week TEXT CHECK(day_of_week IN (
                    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
                )),
                period INTEGER CHECK(period BETWEEN 1 AND 7),
                room_number TEXT NOT NULL,
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
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
                custom_urgency INTEGER DEFAULT 5 CHECK(custom_urgency BETWEEN 1 AND 10),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        ''' )

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER,
                giver_email TEXT,
                receiver_email TEXT,
                qr_token TEXT UNIQUE NOT NULL,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                FOREIGN KEY (item_id) REFERENCES items(item_id),
                FOREIGN KEY (giver_email) REFERENCES users(email),
                FOREIGN KEY (receiver_email) REFERENCES users(email)
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

    def add_school_class(self, user_email, day_of_week, period, room_number):
        """Adds a specific class/room location to a user's daily routine."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO school_schedules (user_email, day_of_week, period, room_number)
            VALUES (?, ?, ?, ?)
        ''', (user_email, day_of_week, period, str(room_number)))
        conn.commit()
        conn.close()

    def add_item(self, user_email, item_name, status, custom_urgency=5):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO items (user_email, item_name, status, custom_urgency) 
            VALUES (?, ?, ?, ?)
        ''', (user_email, item_name.lower(), status.lower(), custom_urgency))
        conn.commit()
        conn.close()

    def _calculate_schedule_score(self, email1, email2):
        """
        Analyses two users' schedules to find overlap.
        - Exact same room during the same period = 25 pts (Max)
        - Same building floor/hallway corridor match = 15 pts
        - No schedule overlaps = 5 pts
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT day_of_week, period, room_number FROM school_schedules WHERE user_email = ?', (email1,))
        sched1 = cursor.fetchall()
        
        cursor.execute('SELECT day_of_week, period, room_number FROM school_schedules WHERE user_email = ?', (email2,))
        sched2 = cursor.fetchall()
        
        conn.close()
        
        lookup2 = {(day, period): room for day, period, room in sched2}
        
        max_overlap_bonus = 5
        
        for day, period, room1 in sched1:
            if (day, period) in lookup2:
                room2 = lookup2[(day, period)]
                
                if room1 == room2:
                    return 25 
                
                elif room1[0] == room2[0] and len(room1) == len(room2):
                    max_overlap_bonus = max(max_overlap_bonus, 15)
                    
        return max_overlap_bonus

    def calculate_match_score(self, viewer_email, target_item_id):
        """Calculates urgency prioritizing exact room/schedule connections."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT i.item_name, i.custom_urgency, u.email, u.trust_score
            FROM items i
            JOIN users u ON i.user_email = u.email
            WHERE i.item_id = ?
        ''', (target_item_id,))
        item_data = cursor.fetchone()
        conn.close()
        
        if not item_data:
            return 0
            
        item_name, custom_urgency, owner_email, owner_trust = item_data
        
        category_weights = {'calculator': 40, 'backpack': 35, 'water_bottle': 30, 'scissors': 25, 'notebook': 20}
        category_score = category_weights.get(item_name, 10)
        
        overlap_score = self._calculate_schedule_score(viewer_email, owner_email)
        
        trust_score = min(25, int((owner_trust / 100) * 20)) 
        
        urgency_score = min(10, max(1, custom_urgency))
        
        return min(100, category_score + overlap_score + trust_score + urgency_score)