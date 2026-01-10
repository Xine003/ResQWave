-- Fix N006 neighborhood assignment
-- This updates N006 to be owned by FOCALP020 (Westlee Rivera)

USE resqwave;

UPDATE neighborhood 
SET focalPersonID = 'FOCALP020' 
WHERE id = 'N006';

-- Verify the update
SELECT id, focalPersonID 
FROM neighborhood 
WHERE id = 'N006';
