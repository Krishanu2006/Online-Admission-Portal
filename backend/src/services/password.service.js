
const bcrypt = require("bcryptjs");
const pool = require("../config/mysql");

const HISTORY_LIMIT = 5;
const BCRYPT_ROUNDS = 12;

async function changePassword(userId, newPassword, actorId = null) {
  if (
    typeof newPassword !== "string" ||
    newPassword.length < 12
  ) {
    throw new Error("Password must be at least 12 characters long.");
  }

  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    // Lock the account while changing its password.
    const [users] = await connection.execute(
      `SELECT
         id,
         user_id,
         password_hash,
         is_active
       FROM users
       WHERE id = ?
       FOR UPDATE`,
      [userId]
    );

    if (users.length === 0) {
      throw new Error("User not found.");
    }

    const user = users[0];

    if (!user.is_active) {
      throw new Error("Your account is inactive.");
    }

    // Audit fields must use the public user_id, not users.id.
    const auditActorId =
      actorId == null ? user.user_id : String(actorId);

    if (
      !user.user_id ||
      String(auditActorId) !== String(user.user_id)
    ) {
      throw new Error("Invalid password-change audit identity.");
    }

    // Read the most recent five historical password hashes.
    const [history] = await connection.execute(
      `SELECT password_hash
       FROM user_password_versions
       WHERE user_pk = ?
       ORDER BY effective_start_date DESC, version_id DESC
       LIMIT ?`,
      [user.id, HISTORY_LIMIT]
    );

    // Check the current password hash and historical hashes.
    const hashesToCheck = new Set([
      user.password_hash,
      ...history.map((row) => row.password_hash),
    ].filter(Boolean));

    for (const oldHash of hashesToCheck) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        throw new Error(
          "You cannot reuse any of your last five passwords."
        );
      }
    }

    const newHash = await bcrypt.hash(
      newPassword,
      BCRYPT_ROUNDS
    );

    // Close the currently active history record.
    await connection.execute(
      `UPDATE user_password_versions
       SET effective_end_date = UTC_TIMESTAMP(),
           last_update_date = UTC_TIMESTAMP(),
           last_update_by = ?
       WHERE user_pk = ?
         AND effective_end_date IS NULL`,
      [auditActorId, user.id]
    );

    // Add a new history row. Older rows are preserved.
    await connection.execute(
      `INSERT INTO user_password_versions (
         user_pk,
         user_id,
         password_hash,
         created_date,
         created_by,
         last_update_date,
         last_update_by,
         effective_start_date,
         effective_end_date
       )
       VALUES (
         ?, ?, ?, UTC_TIMESTAMP(), ?, UTC_TIMESTAMP(), ?,
         UTC_TIMESTAMP(), NULL
       )`,
      [
        user.id,
        user.user_id,
        newHash,
        auditActorId,
        auditActorId,
      ]
    );

    // Update the current password used by login.
    await connection.execute(
      `UPDATE users
       SET password_hash = ?,
           password_changed_at = UTC_TIMESTAMP(),
           must_change_password = 0,
           last_update_date = UTC_TIMESTAMP(),
           last_update_by = ?
       WHERE id = ?`,
      [newHash, auditActorId, user.id]
    );

    await connection.commit();
    transactionStarted = false;

    return {
      success: true,
      message: "Password changed successfully.",
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Password-change rollback failed:",
          rollbackError.message
        );
      }
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function getPasswordStatus(userId) {
  const [rows] = await pool.execute(
    `SELECT
       must_change_password,
       password_changed_at,
       CASE
         WHEN password_changed_at IS NULL THEN 1
         WHEN UTC_TIMESTAMP() >=
              DATE_ADD(password_changed_at, INTERVAL 1 MONTH)
         THEN 1
         ELSE 0
       END AS password_expired
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    throw new Error("User not found.");
  }

  const user = rows[0];

  return {
    mustChangePassword:
      Boolean(user.must_change_password) ||
      Boolean(user.password_expired),
    passwordChangedAt: user.password_changed_at,
  };
}

module.exports = {
  changePassword,
  getPasswordStatus,
};
