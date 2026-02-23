-- 1. First, let's see all shifts
SELECT 
    Id,
    UserId,
    datetime(OpenedAt, 'localtime') as OpenedAtLocal,
    datetime(ClosedAt, 'localtime') as ClosedAtLocal,
    IsClosed,
    OpeningBalance,
    ClosingBalance
FROM Shifts 
ORDER BY Id DESC
LIMIT 10;

-- 2. Delete any shifts with NULL OpenedAt (invalid data)
DELETE FROM Shifts WHERE OpenedAt IS NULL;

-- 3. Close any old open shifts (older than 1 day)
UPDATE Shifts 
SET IsClosed = 1,
    ClosedAt = datetime('now'),
    ClosingBalance = OpeningBalance + TotalCash
WHERE IsClosed = 0 
  AND datetime(OpenedAt) < datetime('now', '-1 day');

-- 4. Now check remaining open shifts
SELECT 
    Id,
    UserId,
    datetime(OpenedAt, 'localtime') as OpenedAtLocal,
    IsClosed,
    OpeningBalance,
    ROUND((julianday('now') - julianday(OpenedAt)) * 24, 1) as HoursOpen
FROM Shifts 
WHERE IsClosed = 0;

-- 5. If you want to test warnings, modify the ONLY open shift to 13 hours ago
-- Uncomment the line below after checking the results above:
-- UPDATE Shifts SET OpenedAt = datetime('now', '-13 hours') WHERE IsClosed = 0 LIMIT 1;
