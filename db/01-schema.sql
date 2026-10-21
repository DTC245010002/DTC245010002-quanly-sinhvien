CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  teacher VARCHAR(100)
);
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  class_id INT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);
CREATE TABLE grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  score DECIMAL(4,2) CHECK (score BETWEEN 0 AND 10),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
INSERT INTO classes (name, teacher) VALUES ('CNTT-K20A','Nguyen Van A'),('CNTT-K20B','Tran Thi B');
INSERT INTO students (student_code, full_name, email, class_id) VALUES
 ('SV001','Le Van C','c@example.com',1),('SV002','Pham Thi D','d@example.com',2);
INSERT INTO grades (student_id, subject, score) VALUES (1,'Co so du lieu',8.5),(2,'Mang may tinh',9.0);
