SELECT date_requested, COUNT(*) as count
FROM requisition_slips
GROUP BY
    date_requested
ORDER BY date_requested;