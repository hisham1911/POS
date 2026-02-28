-- حذف RefundLog للطلب 112 عشان تقدر تسترجعه تاني
DELETE FROM RefundLogs WHERE OrderId = 112;

-- إعادة حالة الطلب لـ Completed
UPDATE Orders SET Status = 'Completed', RefundReason = NULL, RefundedAt = NULL, RefundedByUserId = NULL WHERE Id = 112;
