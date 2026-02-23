-- Script to test Shift Warnings
-- This will modify the OpenedAt time to 13 hours ago (using local time)

UPDATE Shifts 
SET OpenedAt = datetime('now', 'localtime', '-13 hours')
WHERE IsClosed = 0;

-- Check the result
SELECT 
    Id,
    UserId,
    datetime(OpenedAt, 'localtime') as OpenedAtLocal,
    IsClosed,
    ROUND((julianday('now', 'localtime') - julianday(OpenedAt, 'localtime')) * 24, 1) as HoursOpen
FROM Shifts 
WHERE IsClosed = 0;
