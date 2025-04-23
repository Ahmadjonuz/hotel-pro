-- Insert sample housekeeping staff
INSERT INTO housekeeping_staff (name, job_position, status, phone, email) VALUES
    ('Aziza Karimova', 'Senior Housekeeper', 'available', '+998901234567', 'aziza@example.com'),
    ('Dilshod Umarov', 'Housekeeper', 'available', '+998907654321', 'dilshod@example.com'),
    ('Nodira Saidova', 'Housekeeper', 'busy', '+998903216547', 'nodira@example.com'),
    ('Jamshid Alimov', 'Housekeeper', 'available', '+998907890123', 'jamshid@example.com');

-- Insert sample housekeeping tasks
INSERT INTO housekeeping_tasks (room_number, status, priority, notes, scheduled_date) VALUES
    ('101', 'pending', 'high', 'Regular cleaning and bed making', NOW()),
    ('102', 'pending', 'medium', 'Change towels and bedding', NOW()),
    ('201', 'pending', 'urgent', 'Deep cleaning required', NOW()),
    ('202', 'pending', 'low', 'Routine maintenance', NOW()),
    ('301', 'pending', 'medium', 'VIP guest arriving - special attention needed', NOW()); 