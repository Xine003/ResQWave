-- ============================================================================
-- ⚠️  DEPRECATED - DO NOT USE THIS FILE  ⚠️
-- ============================================================================
-- This SQL file has been REPLACED by application-level code implementation.
-- 
-- ❌ DO NOT RUN THIS FILE IN PRODUCTION OR DEVELOPMENT
-- ❌ This file is kept for reference only
--
-- ✅ USE INSTEAD: Code-based implementation in:
--    - src/services/neighborhoodAssignmentService.js
--    - src/controllers/neighborhoodAssignmentController.js
--    - API endpoints: /api/neighborhood-assignments/*
--
-- 📚 Documentation:
--    - NEIGHBORHOOD_ASSIGNMENT_README.md (overview)
--    - NEIGHBORHOOD_ASSIGNMENT_GUIDE.md (complete guide)
--    - SQL_TO_CODE_CONVERSION.md (migration details)
--
-- 🔧 If you already ran this file, clean up with:
--    DROP PROCEDURE IF EXISTS RebalanceNeighborhoodAssignments;
--    DROP TRIGGER IF EXISTS AfterFocalPersonArchive;
--    DROP TRIGGER IF EXISTS BeforeNeighborhoodInsert;
--
-- Last Updated: January 13, 2026
-- Status: DEPRECATED - Replaced by code-based implementation
-- ============================================================================

-- ============================================================================
-- ORIGINAL FILE CONTENT (COMMENTED OUT - FOR REFERENCE ONLY)
-- ============================================================================
/*
-- ============================================================================
-- Dynamic Neighborhood Assignment System
-- ============================================================================
-- PURPOSE: Automatically maintains neighborhood-to-focal-person assignments
-- HANDLES: Account switches, new accounts, archiving, and unassigned neighborhoods
-- SCOPE: Only affects 'neighborhood' and 'focalPerson' tables
-- SAFETY: Idempotent - safe to run multiple times
-- ============================================================================

USE resqwave;

DELIMITER $$

-- ============================================================================
-- STORED PROCEDURE: Rebalance Neighborhood Assignments
-- ============================================================================
-- Call this procedure whenever:
-- 1. A focal person account is created
-- 2. A focal person account is archived/deleted
-- 3. A focal person switches accounts
-- 4. Periodic maintenance (recommended: daily via cron job)
-- ============================================================================

DROP PROCEDURE IF EXISTS RebalanceNeighborhoodAssignments$$

CREATE PROCEDURE RebalanceNeighborhoodAssignments(
    IN p_focalPersonId VARCHAR(255),  -- Optional: specific focal person to reassign from (NULL = rebalance all)
    IN p_dryRun BOOLEAN                -- TRUE = show changes only, FALSE = apply changes
)
BEGIN
    DECLARE v_affectedCount INT DEFAULT 0;
    DECLARE v_activeFocalCount INT DEFAULT 0;
    DECLARE v_unassignedCount INT DEFAULT 0;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Count active focal persons
    SELECT COUNT(*) INTO v_activeFocalCount
    FROM focalPerson
    WHERE archived = 0;
    
    -- Ensure at least one active focal person exists
    IF v_activeFocalCount = 0 THEN
        SELECT 'ERROR: No active focal persons available for assignment' AS status;
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- Log current state
    SELECT 'BEFORE REBALANCE' AS phase;
    SELECT 
        n.id AS neighborhoodID,
        n.focalPersonID AS currentAssignment,
        CASE 
            WHEN n.focalPersonID IS NULL OR n.focalPersonID = '' THEN 'UNASSIGNED'
            WHEN n.focalPersonID NOT IN (SELECT id FROM focalPerson WHERE archived = 0) THEN 'ORPHANED'
            ELSE 'VALID'
        END AS assignmentStatus,
        COUNT(r.id) AS residenceCount
    FROM neighborhood n
    LEFT JOIN residence r ON n.id = r.neighborhoodID
    WHERE n.archived = 0
    GROUP BY n.id, n.focalPersonID;
    
    -- ========================================================================
    -- STEP 1: Handle specific focal person reassignment (account switch/archive)
    -- ========================================================================
    IF p_focalPersonId IS NOT NULL THEN
        -- Reassign neighborhoods from specified focal person
        UPDATE neighborhood n
        SET focalPersonID = (
            SELECT fp.id
            FROM focalPerson fp
            WHERE fp.archived = 0
              AND fp.id != p_focalPersonId  -- Don't reassign to same person
            ORDER BY (
                SELECT COUNT(*) 
                FROM neighborhood 
                WHERE focalPersonID = fp.id AND archived = 0
            ) ASC,
            fp.createdAt ASC
            LIMIT 1
        )
        WHERE n.focalPersonID = p_focalPersonId
          AND n.archived = 0;
        
        SET v_affectedCount = ROW_COUNT();
        SELECT CONCAT('Reassigned ', v_affectedCount, ' neighborhoods from focal person: ', p_focalPersonId) AS message;
    END IF;
    
    -- ========================================================================
    -- STEP 2: Fix NULL or empty assignments
    -- ========================================================================
    UPDATE neighborhood n
    SET focalPersonID = (
        SELECT fp.id
        FROM focalPerson fp
        WHERE fp.archived = 0
        ORDER BY (
            SELECT COUNT(*) 
            FROM neighborhood 
            WHERE focalPersonID = fp.id AND archived = 0
        ) ASC,
        fp.createdAt ASC
        LIMIT 1
    )
    WHERE (n.focalPersonID IS NULL OR n.focalPersonID = '')
      AND n.archived = 0;
    
    SET v_unassignedCount = ROW_COUNT();
    
    -- ========================================================================
    -- STEP 3: Fix orphaned assignments (pointing to archived/deleted focal persons)
    -- ========================================================================
    UPDATE neighborhood n
    SET focalPersonID = (
        SELECT fp.id
        FROM focalPerson fp
        WHERE fp.archived = 0
        ORDER BY (
            SELECT COUNT(*) 
            FROM neighborhood 
            WHERE focalPersonID = fp.id AND archived = 0
        ) ASC,
        fp.createdAt ASC
        LIMIT 1
    )
    WHERE n.focalPersonID NOT IN (
        SELECT id FROM focalPerson WHERE archived = 0
    )
      AND n.archived = 0;
    
    SET v_affectedCount = v_affectedCount + ROW_COUNT();
    
    -- ========================================================================
    -- VERIFICATION: Check results
    -- ========================================================================
    SELECT 'AFTER REBALANCE' AS phase;
    SELECT 
        n.id AS neighborhoodID,
        n.focalPersonID,
        CONCAT(fp.firstName, ' ', fp.lastName) AS assignedFocalPerson,
        (SELECT COUNT(*) FROM neighborhood WHERE focalPersonID = fp.id AND archived = 0) AS totalAssigned,
        n.createdAt AS neighborhoodCreatedAt,
        fp.createdAt AS focalPersonCreatedAt
    FROM neighborhood n
    LEFT JOIN focalPerson fp ON n.focalPersonID = fp.id
    WHERE n.archived = 0
    ORDER BY fp.firstName, fp.lastName, n.id;
    
    -- Count remaining issues
    SELECT 
        (SELECT COUNT(*) FROM neighborhood WHERE (focalPersonID IS NULL OR focalPersonID = '') AND archived = 0) AS unassignedCount,
        (SELECT COUNT(*) FROM neighborhood n LEFT JOIN focalPerson fp ON n.focalPersonID = fp.id WHERE n.archived = 0 AND fp.id IS NULL) AS orphanedCount;
    
    -- Summary
    SELECT 
        v_activeFocalCount AS activeFocalPersons,
        v_unassignedCount AS fixedUnassigned,
        v_affectedCount AS totalReassigned,
        CASE WHEN p_dryRun THEN 'DRY RUN - No changes committed' ELSE 'Changes committed successfully' END AS status;
    
    -- Apply or rollback based on dry run flag
    IF p_dryRun THEN
        ROLLBACK;
    ELSE
        COMMIT;
    END IF;
END$$

-- ============================================================================
-- TRIGGER: Auto-rebalance when focal person is archived
-- ============================================================================
DROP TRIGGER IF EXISTS AfterFocalPersonArchive$$

CREATE TRIGGER AfterFocalPersonArchive
AFTER UPDATE ON focalPerson
FOR EACH ROW
BEGIN
    -- Only trigger when archived status changes from 0 to 1
    IF OLD.archived = 0 AND NEW.archived = 1 THEN
        -- Reassign neighborhoods from archived focal person
        UPDATE neighborhood
        SET focalPersonID = (
            SELECT fp.id
            FROM focalPerson fp
            WHERE fp.archived = 0
            ORDER BY (
                SELECT COUNT(*) 
                FROM neighborhood 
                WHERE focalPersonID = fp.id AND archived = 0
            ) ASC,
            fp.createdAt ASC
            LIMIT 1
        )
        WHERE focalPersonID = NEW.id
          AND archived = 0;
    END IF;
END$$

-- ============================================================================
-- TRIGGER: Auto-assign when new neighborhood is created
-- ============================================================================
DROP TRIGGER IF EXISTS BeforeNeighborhoodInsert$$

CREATE TRIGGER BeforeNeighborhoodInsert
BEFORE INSERT ON neighborhood
FOR EACH ROW
BEGIN
    -- Auto-assign to least-loaded focal person if not specified
    IF NEW.focalPersonID IS NULL OR NEW.focalPersonID = '' THEN
        SET NEW.focalPersonID = (
            SELECT fp.id
            FROM focalPerson fp
            WHERE fp.archived = 0
            ORDER BY (
                SELECT COUNT(*) 
                FROM neighborhood 
                WHERE focalPersonID = fp.id AND archived = 0
            ) ASC,
            fp.createdAt ASC
            LIMIT 1
        );
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Dry run to see what would change (no commit)
-- CALL RebalanceNeighborhoodAssignments(NULL, TRUE);

-- Example 2: Rebalance all neighborhoods (commit changes)
-- CALL RebalanceNeighborhoodAssignments(NULL, FALSE);

-- Example 3: Reassign neighborhoods from specific focal person (e.g., account switch)
-- CALL RebalanceNeighborhoodAssignments('focal-person-id-here', FALSE);

-- Example 4: Manual one-time execution (for initial setup)
CALL RebalanceNeighborhoodAssignments(NULL, FALSE);
*/

-- ============================================================================
-- END OF DEPRECATED FILE
-- ============================================================================

