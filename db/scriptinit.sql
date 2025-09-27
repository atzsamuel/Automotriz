CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL, -- visitante, administrador, super-administrador
    mfaSecret NVARCHAR(255),
    deleted BIT DEFAULT 0
);

CREATE TABLE Vehicles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    marca NVARCHAR(50) NOT NULL,
    modelo NVARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    precio DECIMAL(18,2) NOT NULL,
    deleted BIT DEFAULT 0
);

CREATE TABLE Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NULL,
    ip NVARCHAR(50),
    endpoint NVARCHAR(100),
    action NVARCHAR(50),
    success BIT,
    timestamp DATETIME DEFAULT GETDATE()
);


INSERT INTO Users (username, passwordHash, role, mfaSecret, deleted)
VALUES 
('visitante1', '$2b$10$SWx.0aX.C4/CWmtb8XpoBe0HgM1/FFePFvEffe6fkHfEdLswMMK82', 'visitante', NULL, 0),
('admin1', '$2b$10$SWx.0aX.C4/CWmtb8XpoBe0HgM1/FFePFvEffe6fkHfEdLswMMK82', 'administrador', NULL, 0),
('superadmin1', '$2b$10$SWx.0aX.C4/CWmtb8XpoBe0HgM1/FFePFvEffe6fkHfEdLswMMK82', 'super-administrador', 'JJVX2ZBWHYQXKYSWNVIFAMCUMV4HIKLQ', 0);


INSERT INTO Vehicles (marca, modelo, anio, precio, deleted)
VALUES
('Toyota', 'Corolla', 2020, 180000.00, 0),
('Honda', 'Civic', 2019, 175000.00, 0),
('Ford', 'Focus', 2018, 160000.00, 0);

UPDATE Users
SET mfaSecret = 'JJVX2ZBWHYQXKYSWNVIFAMCUMV4HIKLQ '
WHERE id=3;

UPDATE Users
SET passwordHash = '$2b$10$SWx.0aX.C4/CWmtb8XpoBe0HgM1/FFePFvEffe6fkHfEdLswMMK82'
WHERE id=3;

select * from Vehicles;
select * from Users;
select * from logs;